import { register } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'
import { el } from '../../core/editor-dom.js'
import { AlertDialogBase } from './AlertDialogBase.js'
import { createModalView, type ModalView } from '../modal/view.js'

export class AlertDialog extends AlertDialogBase {
    private view?: ModalView
    private cancelButton?: HTMLButtonElement
    private confirmButton?: HTMLButtonElement

    render(): Node {
        this.view = createModalView(
            () => { this.close('close-button') },
            event => this.handleCancel(event),
            event => this.handleBackdrop(event),
        )
        this.view.dialog.setAttribute('role', 'alertdialog')
        this.cancelButton = el('button', 'cancel')
        this.cancelButton.type = 'button'
        this.cancelButton.addEventListener('click', event => this.cancel(event))
        this.confirmButton = el('button', 'confirm')
        this.confirmButton.type = 'button'
        this.confirmButton.addEventListener('click', event => this.confirm(event))
        this.view.footer.prepend(this.cancelButton, this.confirmButton)
        return this.view.root
    }

    protected dialogElement(): HTMLDialogElement | undefined { return this.view?.dialog }

    protected syncDialog(): void {
        const view = this.view
        if (!view || !this.cancelButton || !this.confirmButton) return
        view.heading.textContent = scalarText(this.heading)
        view.description.textContent = scalarText(this.description)
        view.description.hidden = !scalarText(this.description)
        view.close.hidden = !bool(this.dismissible)
        view.close.setAttribute('aria-label', this.closeText())
        view.close.title = this.closeText()
        this.cancelButton.textContent = this.cancelText()
        this.confirmButton.textContent = this.confirmText()
        this.cancelButton.disabled = bool(this.busy)
        this.confirmButton.disabled = bool(this.busy)
        this.confirmButton.toggleAttribute('data-destructive', bool(this.destructive))
        this.confirmButton.setAttribute('aria-busy', String(bool(this.busy)))
        this.setAttribute('modal-size', ['sm', 'md', 'lg', 'full'].includes(this.modalSize) ? this.modalSize : 'sm')
    }
}

register('cb-alert-dialog', AlertDialog)
export { AlertDialogBase }
export type { AlertDialogProps } from './AlertDialogBase.js'
