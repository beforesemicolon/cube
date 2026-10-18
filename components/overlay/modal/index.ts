import { register } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'
import { actionLabel } from '../../action/create.js'
import { ModalBase } from './ModalBase.js'
import { createModalView, type ModalView } from './view.js'

export class Modal extends ModalBase {
    private view?: ModalView

    render(): Node {
        this.view = createModalView(
            () => { this.close('close-button') },
            event => this.handleCancel(event),
            event => this.handleBackdrop(event),
        )
        return this.view.root
    }

    protected dialogElement(): HTMLDialogElement | undefined { return this.view?.dialog }

    protected syncDialog(): void {
        const view = this.view
        if (!view) return
        view.heading.textContent = scalarText(this.heading)
        view.description.textContent = scalarText(this.description)
        view.description.hidden = !scalarText(this.description)
        view.close.hidden = !bool(this.dismissible)
        actionLabel(view.close, this.closeText())
        this.setAttribute('modal-size', ['sm', 'md', 'lg', 'full', 'page'].includes(this.modalSize) ? this.modalSize : 'md')
        this.dataset.layer = this.layer === 'document' ? 'document' : 'top'
        view.dialog.setAttribute('aria-modal', String(this.layer !== 'document'))
    }
}

register('cb-modal', Modal)
export { ModalBase }
export type { ModalProps, ModalSize, ModalLayer, ModalCloseReason } from './ModalBase.js'
export { showModal, hideModal, closeAllModals, configureModalHost, getModalHost, type ModalRequest, type ModalResult, type ModalAction, type ModalActionContext, type ModalContent, type ModalHandle, type ModalHostOptions } from './service.js'
