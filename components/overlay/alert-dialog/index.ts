import { register } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'
import { actionLabel, createButton } from '../../action/create.js'
import type { Button } from '../../action/button/index.js'
import { AlertDialogBase } from './AlertDialogBase.js'
import { createModalView, type ModalView } from '../modal/view.js'

export class AlertDialog extends AlertDialogBase {
    private view?: ModalView
    private cancelButton?: Button
    private confirmButton?: Button

    render(): Node {
        this.view = createModalView(
            () => { this.close('close-button') },
            event => this.handleCancel(event),
            event => this.handleBackdrop(event),
        )
        this.view.dialog.setAttribute('role', 'alertdialog')
        this.cancelButton = createButton('cancel', event => this.cancel(event))
        this.confirmButton = createButton('confirm', event => this.confirm(event))
        this.confirmButton.variant = 'primary'
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
        actionLabel(view.close, this.closeText())
        actionLabel(this.cancelButton, this.cancelText())
        actionLabel(this.confirmButton, this.confirmText())
        this.cancelButton.disabled = bool(this.busy)
        this.confirmButton.loading = bool(this.busy)
        this.confirmButton.variant = bool(this.destructive) ? 'destructive' : 'primary'
        this.setAttribute('modal-size', ['sm', 'md', 'lg', 'full'].includes(this.modalSize) ? this.modalSize : 'sm')
    }
}

register('cb-alert-dialog', AlertDialog)
export { AlertDialogBase }
export type { AlertDialogProps } from './AlertDialogBase.js'
