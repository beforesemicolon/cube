import type { ButtonVariant } from '../../action/button/ButtonBase.js'
import { when, html, repeat, state, type Template } from '../../core/runtime.js'
import type { Modal, ModalCloseReason, ModalLayer, ModalSize } from './index.js'

export interface ModalContent { node: Node; dispose?: () => void }
export type ModalContentFactory = () => string | Node | ModalContent
export interface ModalActionContext {
    readonly id: string
    readonly actionId: string
    readonly modal: Modal
    close(reason?: ModalCloseReason): boolean
}
export interface ModalAction {
    id?: string
    label: string
    icon?: string
    iconSrc?: string
    variant?: ButtonVariant
    value?: string
    disabled?: boolean
    loading?: boolean
    dismiss?: boolean
    href?: string
    target?: string
    onAction?: (context: ModalActionContext) => void | Promise<void>
}
export interface ModalRequest {
    id?: string
    title?: string
    heading?: string
    description?: string
    body?: string | Node | ModalContentFactory
    footer?: Node
    dismissible?: boolean
    closeOnBackdrop?: boolean
    modalSize?: ModalSize
    size?: ModalSize
    layer?: ModalLayer
    returnFocus?: boolean
    showFooter?: boolean
    showCancel?: boolean
    cancelLabel?: string
    actions?: readonly ModalAction[]
    actionLabel?: string
    action?: (context: ModalActionContext) => void | Promise<void>
    onCancel?: (modal: Modal) => void | Promise<void>
    onError?: (error: Error) => void
}
export interface ModalResult { id: string; reason: ModalCloseReason; actionId?: string; value?: string }
export interface ModalHostOptions { parent?: HTMLElement }
export type ModalHandle = Promise<ModalResult> & {
    readonly id: string
    readonly element: Modal
    close(reason?: ModalCloseReason): boolean
    update(request: Partial<ModalRequest>): void
}

interface ModalRecord {
    id: string
    modal: Modal
    request: ModalRequest
    result: Promise<ModalResult>
    resolve(result: ModalResult): void
    footerTemplate?: Template
    disposeContent?: () => void
    actionResult?: Pick<ModalResult, 'actionId' | 'value'>
    handle: ModalHandle
    documentLayerActive: boolean
}

let sequence = 0
let options: ModalHostOptions = {}
const records = new Map<string, ModalRecord>()
const inertState = new Map<HTMLElement, boolean>()
let documentLayerCount = 0

export function configureModalHost(next: ModalHostOptions): void { options = { ...options, ...next } }

export function getModalHost(): HTMLElement {
    const parent = options.parent ?? document.body
    const existing = parent.querySelector<HTMLElement>(':scope > [data-cb-overlay-root]')
    if (existing) return existing
    const root = document.createElement('div')
    root.dataset.cbOverlayRoot = ''
    root.style.position = parent === document.body ? 'fixed' : 'absolute'
    root.style.inset = '0'
    root.style.zIndex = 'var(--z-index-overlay,80)'
    root.style.pointerEvents = 'none'
    parent.append(root)
    return root
}

function setDocumentInert(active: boolean): void {
    const root = getModalHost()
    if (active) {
        documentLayerCount += 1
        if (documentLayerCount > 1) return
        for (const child of [...root.parentElement?.children ?? []]) {
            if (!(child instanceof HTMLElement) || child === root) continue
            inertState.set(child, child.inert)
            child.inert = true
        }
        return
    }
    documentLayerCount = Math.max(0, documentLayerCount - 1)
    if (documentLayerCount) return
    for (const [element, wasInert] of inertState) if (element.isConnected) element.inert = wasInert
    inertState.clear()
}

function contentValue(body: ModalRequest['body']): { node?: Node; dispose?: () => void } {
    const value = typeof body === 'function' ? body() : body
    if (typeof value === 'string') return { node: document.createTextNode(value) }
    if (value instanceof Node) return { node: value }
    if (value) return value
    return {}
}

function actionsFor(request: ModalRequest): readonly ModalAction[] {
    const actions = [...(request.actions ?? [])]
    if (request.actionLabel) actions.push({ id: 'primary', label: request.actionLabel, variant: 'primary', onAction: request.action })
    return actions
}

function report(record: ModalRecord, cause: Error): void {
    record.request.onError?.(cause)
    record.modal.onError(cause)
}

function applyRequest(record: ModalRecord): void {
    const { modal, request } = record
    modal.heading = request.heading ?? request.title ?? ''
    modal.description = request.description ?? ''
    modal.cancelLabel = request.cancelLabel ?? ''
    modal.showCancel = request.showFooter !== false && request.showCancel !== false
    modal.dismissible = request.dismissible ?? true
    modal.closeOnBackdrop = request.closeOnBackdrop ?? true
    modal.modalSize = request.modalSize ?? request.size ?? 'md'
    modal.layer = request.layer ?? 'top'
    modal.returnFocus = request.returnFocus ?? true
    record.footerTemplate?.unmount()
    record.footerTemplate = undefined
    modal.replaceChildren()
    record.disposeContent?.()
    record.disposeContent = undefined
    let content: { node?: Node; dispose?: () => void } = {}
    try { content = contentValue(request.body) }
    catch (cause) { report(record, cause instanceof Error ? cause : new Error(String(cause))) }
    if (content.node) modal.append(content.node)
    record.disposeContent = content.dispose

    const actionList = actionsFor(request)
    const closeFromAction = (action: ModalAction): boolean => {
        const previous = record.actionResult
        record.actionResult = { actionId: action.id ?? '', value: action.value }
        if (!modal.close('action')) {
            record.actionResult = previous
            return false
        }
        return true
    }
    if (request.showFooter !== false && (request.footer || actionList.length)) {
        record.footerTemplate = html`<div slot="footer">${request.footer ?? ''}
            ${repeat(actionList, (action,index) => {
                const actionId=action.id?.trim() || `action-${index+1}`
                const loading=state(action.loading ?? false)
                const run=async(event:Event):Promise<void> => {
                    event.stopPropagation()
                    if(loading[0]() || action.disabled)return
                    const detail={id:record.id,actionId,originalEvent:event}
                    if(!modal.dispatchEvent(new CustomEvent('beforemodalaction',{detail,bubbles:true,composed:true,cancelable:true})))return
                    loading[1](true)
                    try {
                        await action.onAction?.({id:record.id,actionId,modal,close:reason=>modal.close(reason)})
                        modal.emit('modalaction',detail)
                        if(action.dismiss ?? true)closeFromAction({...action,id:actionId})
                    } catch(cause) { report(record,cause instanceof Error?cause:new Error(String(cause))) }
                    finally { loading[1](false) }
                }
                return html`${when(action.href, () => html`<cb-link part="action" label=${action.label} accessible-label=${action.label}
                    href=${action.href} target=${action.target ?? ''} icon=${action.icon ?? ''} icon-src=${action.iconSrc} variant=${action.variant ?? 'ghost'} disabled=${action.disabled ?? false}
                    onnavigate=${(event:Event)=>{event.stopPropagation();if(action.dismiss ?? false)closeFromAction({...action,id:actionId});}}></cb-link>`, () => html`<cb-button part="action" exportparts="control:action-control,label:action-label,button-label:action-label,icon:action-icon,description:action-description" label=${action.label} accessible-label=${action.label} icon=${action.icon ?? ''} icon-src=${action.iconSrc}
                        variant=${action.variant ?? (index === actionList.length-1?'primary':'secondary')} value=${action.value ?? ''}
                        disabled=${action.disabled ?? false} loading=${loading[0]} onaction=${run}></cb-button>`)}`
            })}
        </div>`
        record.footerTemplate.render(modal)
    }
}

export function showModal(request: ModalRequest = {}): ModalHandle {
    const id = request.id?.trim() || `cb-modal-${++sequence}`
    records.get(id)?.handle.close('replaced')
    const modal = document.createElement('cb-modal') as Modal
    modal.id = id
    modal.style.pointerEvents = 'auto'
    let resolveResult: (result: ModalResult) => void = () => undefined
    const result = new Promise<ModalResult>(resolve => { resolveResult = resolve })
    const record = { id, modal, request: { ...request }, result, resolve: resolveResult, documentLayerActive: false } as ModalRecord
    const handle = Object.assign(result, {
        id,
        element: modal,
        close: (reason: ModalCloseReason = 'programmatic'): boolean => modal.close(reason),
        update: (next: Partial<ModalRequest>): void => {
            record.request = { ...record.request, ...next, id }
            applyRequest(record)
            const active = modal.open && modal.layer === 'document'
            if (active !== record.documentLayerActive) {
                setDocumentInert(active)
                record.documentLayerActive = active
            }
        },
    }) as ModalHandle
    record.handle = handle
    records.set(id, record)
    applyRequest(record)
    getModalHost().append(modal)
    modal.addEventListener('cancel', () => {
        try {
            const result = record.request.onCancel?.(modal)
            if (result) void result.catch(cause => report(record, cause instanceof Error ? cause : new Error(String(cause))))
        } catch (cause) { report(record, cause instanceof Error ? cause : new Error(String(cause))) }
    })
    modal.addEventListener('close', event => {
        const detail = (event as CustomEvent<{ reason: ModalCloseReason }>).detail
        if (record.documentLayerActive) setDocumentInert(false)
        record.documentLayerActive = false
        record.disposeContent?.()
        record.footerTemplate?.unmount()
        records.delete(id)
        modal.remove()
        record.resolve({ id, reason: detail.reason, ...record.actionResult })
    }, { once: true })
    if (modal.show()) {
        if (modal.layer === 'document') {
            setDocumentInert(true)
            record.documentLayerActive = true
        }
    } else {
        record.disposeContent?.()
        records.delete(id)
        modal.remove()
        record.resolve({ id, reason: 'cancelled' })
    }
    return handle
}

export function hideModal(id: string, reason: ModalCloseReason = 'programmatic'): boolean { return records.get(id)?.handle.close(reason) ?? false }
export function closeAllModals(reason: ModalCloseReason = 'invalidated'): void {
    for (const record of [...records.values()].reverse()) record.handle.close(reason)
}
