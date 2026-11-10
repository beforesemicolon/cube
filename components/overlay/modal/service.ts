import type { ButtonVariant } from '../../action/button/ButtonBase.js'
import {
    when,
    html,
    repeat,
    state,
    val,
    type Template,
} from '../../core/runtime.js'
import type { Modal, ModalCloseReason, ModalLayer, ModalSize } from './index.js'
import type { ModalRenderer } from './renderer.js'

export interface ModalContent {
    node: Node
    dispose?: () => void
}
export type ModalContentFactory = () => string | Node | ModalContent
export interface ModalActionContext {
    readonly id: string
    readonly actionId: string
    readonly modal: Modal
    close(reason?: ModalCloseReason): boolean
}
export type ModalActionBoolean = boolean | (() => boolean)
export interface ModalAction {
    id?: string
    label: string
    icon?: string
    iconSrc?: string
    variant?: ButtonVariant
    value?: string
    hidden?: ModalActionBoolean
    disabled?: ModalActionBoolean
    loading?: ModalActionBoolean
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
    closeLabel?: string
    actions?: readonly ModalAction[]
    actionLabel?: string
    action?: (context: ModalActionContext) => void | Promise<void>
    onCancel?: (modal: Modal) => void | Promise<void>
    onError?: (error: Error) => void
}
export interface ModalResult {
    id: string
    reason: ModalCloseReason
    actionId?: string
    value?: string
}
export interface ModalHostOptions {
    parent?: HTMLElement
    renderer?: ModalRenderer
}
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
let renderer: ModalRenderer | undefined
const records = new Map<string, ModalRecord>()
const inertState = new Map<HTMLElement, boolean>()
let documentLayerCount = 0

function positionRenderer(host: ModalRenderer, parent: HTMLElement): void {
    host.style.position =
        parent === host.ownerDocument.body ? 'fixed' : 'absolute'
}

export function configureModalHost(next: ModalHostOptions): void {
    options = { ...options, ...next }
    if (next.renderer) renderer = next.renderer
    const parent = options.parent ?? document.body
    if (renderer && next.parent && renderer.parentElement !== parent) {
        parent.append(renderer)
    }
    if (renderer) positionRenderer(renderer, renderer.parentElement ?? parent)
}

export function getModalHost(): ModalRenderer {
    const parent = options.parent ?? document.body
    const configured = options.renderer?.isConnected
        ? options.renderer
        : renderer?.isConnected
          ? renderer
          : undefined
    if (configured?.isConnected) {
        positionRenderer(configured, configured.parentElement ?? parent)
        return configured
    }
    const existing = parent.querySelector<ModalRenderer>(
        ':scope > cb-modal-renderer[data-cb-global], :scope > cb-modal-renderer'
    )
    if (existing) {
        renderer = existing
        positionRenderer(existing, parent)
        return existing
    }
    const host = document.createElement('cb-modal-renderer') as ModalRenderer
    host.dataset.cbGlobal = ''
    host.dataset.cbOverlayRoot = ''
    positionRenderer(host, parent)
    parent.append(host)
    renderer = host
    return host
}

function setDocumentInert(active: boolean): void {
    const root = getModalHost()
    if (active) {
        documentLayerCount += 1
        if (documentLayerCount > 1) return
        for (const child of [...(root.parentElement?.children ?? [])]) {
            if (!(child instanceof HTMLElement) || child === root) continue
            inertState.set(child, child.inert)
            child.inert = true
        }
        return
    }
    documentLayerCount = Math.max(0, documentLayerCount - 1)
    if (documentLayerCount) return
    for (const [element, wasInert] of inertState)
        if (element.isConnected) element.inert = wasInert
    inertState.clear()
}

function contentValue(body: ModalRequest['body']): {
    node?: Node
    dispose?: () => void
} {
    const value = typeof body === 'function' ? body() : body
    if (typeof value === 'string')
        return { node: document.createTextNode(value) }
    if (value instanceof Node) return { node: value }
    if (value) return value
    return {}
}

function actionsFor(request: ModalRequest): readonly ModalAction[] {
    const actions = [...(request.actions ?? [])]
    if (request.actionLabel)
        actions.push({
            id: 'primary',
            label: request.actionLabel,
            variant: 'primary',
            onAction: request.action,
        })
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
    modal.closeLabel = request.closeLabel ?? ''
    modal.showCancel =
        request.showFooter !== false && request.showCancel !== false
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
    try {
        content = contentValue(request.body)
    } catch (cause) {
        report(
            record,
            cause instanceof Error ? cause : new Error(String(cause))
        )
    }
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
        record.footerTemplate = html`<div slot="footer">
            ${request.footer ?? ''}
            ${repeat(actionList, (action, index) => {
                const actionId = action.id?.trim() || `action-${index + 1}`
                const running = state(false)
                const loading = () =>
                    Boolean(val(action.loading)) || running[0]()
                const hidden = () => Boolean(val(action.hidden))
                const disabled = () =>
                    loading() || Boolean(val(action.disabled))
                const run = async (event: Event): Promise<void> => {
                    event.stopPropagation()
                    if (hidden() || disabled()) return
                    const detail = {
                        id: record.id,
                        actionId,
                        originalEvent: event,
                    }
                    if (
                        !modal.dispatchEvent(
                            new CustomEvent('beforemodalaction', {
                                detail,
                                bubbles: true,
                                composed: true,
                                cancelable: true,
                            })
                        )
                    )
                        return
                    running[1](true)
                    try {
                        await action.onAction?.({
                            id: record.id,
                            actionId,
                            modal,
                            close: (reason) => modal.close(reason),
                        })
                        modal.emit('modalaction', detail)
                        if (action.dismiss ?? true)
                            closeFromAction({ ...action, id: actionId })
                    } catch (cause) {
                        report(
                            record,
                            cause instanceof Error
                                ? cause
                                : new Error(String(cause))
                        )
                    } finally {
                        running[1](false)
                    }
                }
                return html`${when(
                    action.href,
                    () =>
                        html`<cb-link
                            part="action"
                            label=${action.label}
                            accessible-label=${action.label}
                            href=${action.href}
                            target=${action.target ?? ''}
                            icon=${action.icon ?? ''}
                            icon-src=${action.iconSrc}
                            variant=${action.variant ?? 'ghost'}
                            hidden=${hidden}
                            disabled=${disabled}
                            onnavigate=${(event: Event) => {
                                event.stopPropagation()
                                if (action.dismiss ?? false)
                                    closeFromAction({ ...action, id: actionId })
                            }}
                        ></cb-link>`,
                    () =>
                        html`<cb-button
                            part="action"
                            exportparts="control:action-control,label:action-label,button-label:action-label,icon:action-icon,description:action-description"
                            label=${action.label}
                            accessible-label=${action.label}
                            icon=${action.icon ?? ''}
                            icon-src=${action.iconSrc}
                            variant=${action.variant ?? (index === actionList.length - 1 ? 'primary' : 'secondary')}
                            value=${action.value ?? ''}
                            hidden=${hidden}
                            disabled=${disabled}
                            loading=${loading}
                            onaction=${run}
                        ></cb-button>`
                )}`
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
    const result = new Promise<ModalResult>((resolve) => {
        resolveResult = resolve
    })
    const record = {
        id,
        modal,
        request: { ...request },
        result,
        resolve: resolveResult,
        documentLayerActive: false,
    } as ModalRecord
    const handle = Object.assign(result, {
        id,
        element: modal,
        close: (reason: ModalCloseReason = 'programmatic'): boolean =>
            modal.close(reason),
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
            if (result)
                void result.catch((cause) =>
                    report(
                        record,
                        cause instanceof Error
                            ? cause
                            : new Error(String(cause))
                    )
                )
        } catch (cause) {
            report(
                record,
                cause instanceof Error ? cause : new Error(String(cause))
            )
        }
    })
    modal.addEventListener('close', (event) => {
        if (event.composedPath()[0] !== modal) return
        const detail = (event as CustomEvent<{ reason: ModalCloseReason }>)
            .detail
        if (record.documentLayerActive) setDocumentInert(false)
        record.documentLayerActive = false
        record.disposeContent?.()
        record.footerTemplate?.unmount()
        records.delete(id)
        modal.remove()
        record.resolve({
            id,
            reason: detail.reason,
            ...record.actionResult,
        })
    })
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

export function hideModal(
    id: string,
    reason: ModalCloseReason = 'programmatic'
): boolean {
    return records.get(id)?.handle.close(reason) ?? false
}
export function closeAllModals(reason: ModalCloseReason = 'invalidated'): void {
    for (const record of [...records.values()].reverse())
        record.handle.close(reason)
}
