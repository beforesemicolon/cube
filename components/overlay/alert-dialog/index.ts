import { css, isNot, or, html, type Template } from '../../core/runtime.js'
import { bool, scalarText } from '../../core/value.js'
import { AlertDialogBase } from './AlertDialogBase.js'
import { createModalView, modalCSS, type ModalView } from '../modal/view.js'
export class AlertDialog extends AlertDialogBase {
    stylesheet = css`${modalCSS}`
    private view?: ModalView
    render(): Template {
        const actions = html`<cb-button part="cancel" exportparts="control:cancel-control,label:cancel-label,button-label:cancel-label,icon:cancel-icon,description:cancel-description" variant="ghost" label="${this.cancelText}"
            hidden="${or(isNot(this.props.dismissible), isNot(this.props.showCancel), isNot(this.cancelText))}" disabled="${this.props.busy}"
            onaction="${(event: Event) => { event.stopPropagation(); this.cancel(event) }}"></cb-button>
            <cb-button part="confirm" exportparts="control:confirm-control,label:confirm-label,button-label:confirm-label,icon:confirm-icon,description:confirm-description" label="${this.confirmText}" loading="${this.props.busy}"
                variant="${() => bool(this.destructive) ? 'destructive' : 'primary'}"
                onaction="${(event: Event) => { event.stopPropagation(); this.confirm(event) }}"></cb-button>`
        this.view = createModalView({
            heading: () => scalarText(this.heading), description: () => scalarText(this.description),
            dismissible: () => bool(this.dismissible), closeLabel: () => this.closeText(), modal: () => this.layer !== 'document',
        }, event => { this.dismiss('close-button', event) }, event => this.handleCancel(event), event => this.handleBackdrop(event), actions, 'alertdialog')
        return this.view.root
    }
    protected dialogElement(): HTMLDialogElement | undefined { return this.view?.dialog }
    protected syncDialog(): void {
        this.setAttribute('modal-size', ['sm', 'md', 'lg', 'full', 'page'].includes(this.modalSize) ? this.modalSize : 'sm')
        this.dataset.layer = this.layer === 'document' ? 'document' : 'top'
    }
}
export { AlertDialogBase };
export type { AlertDialogProps } from './AlertDialogBase.js';
