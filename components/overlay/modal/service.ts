import './index.js'
import type { Modal, ModalCloseReason, ModalSize } from './index.js'

export interface ModalRequest {
    id?: string
    heading?: string
    description?: string
    body?: string | Node
    footer?: Node
    dismissible?: boolean
    closeOnBackdrop?: boolean
    modalSize?: ModalSize
}

export interface ModalResult { id: string; reason: ModalCloseReason }

let sequence = 0

function overlayRoot(): HTMLElement {
    const existing = document.querySelector<HTMLElement>('[data-cb-overlay-root]')
    if (existing) return existing
    const root = document.createElement('div')
    root.dataset.cbOverlayRoot = ''
    document.body.append(root)
    return root
}

export function showModal(request: ModalRequest = {}): Promise<ModalResult> {
    const id = request.id?.trim() || `cb-modal-${++sequence}`
    const modal = document.createElement('cb-modal') as Modal
    modal.id = id
    modal.heading = request.heading ?? ''
    modal.description = request.description ?? ''
    modal.dismissible = request.dismissible ?? true
    modal.closeOnBackdrop = request.closeOnBackdrop ?? true
    modal.modalSize = request.modalSize ?? 'md'
    if (typeof request.body === 'string') modal.append(document.createTextNode(request.body))
    else if (request.body) modal.append(request.body)
    if (request.footer) {
        const footer = document.createElement('div')
        footer.slot = 'footer'
        footer.append(request.footer)
        modal.append(footer)
    }
    overlayRoot().append(modal)
    return new Promise<ModalResult>(resolve => {
        modal.addEventListener('cb-close', event => {
            const detail = (event as CustomEvent<{ reason: ModalCloseReason }>).detail
            modal.remove()
            resolve({ id, reason: detail.reason })
        }, { once: true })
        modal.show()
    })
}

export function hideModal(id: string, reason: ModalCloseReason = 'programmatic'): boolean {
    return (document.getElementById(id) as Modal | null)?.close(reason) ?? false
}
