import { register } from '../../core/Component.js'
import componentStylesheet from './view.css?inline'
import { isNot, or, html, type Template } from '../../core/runtime.js'
import { bool, scalarText } from '../../core/value.js'
import { ModalBase } from './ModalBase.js'
import { createModalView, type ModalView } from './view.js'
export class Modal extends ModalBase {
    stylesheet = componentStylesheet
    static observedAttributes = [...ModalBase.observedAttributes, 'cancel-label', 'show-cancel']
    private view?: ModalView
    render(): Template {
        const actions = html`<cb-button part="cancel" exportparts="control:cancel-control,label:cancel-label,button-label:cancel-label,icon:cancel-icon,description:cancel-description" variant="secondary" label="${this.cancelText}"
            hidden="${or(isNot(this.props.dismissible), isNot(this.props.showCancel), isNot(this.cancelText))}"
            onaction="${(event: Event) => { event.stopPropagation(); this.cancel(event) }}"></cb-button>
            `
        this.view = createModalView({
            heading: () => scalarText(this.heading), description: () => scalarText(this.description),
            dismissible: () => bool(this.dismissible), closeLabel: () => this.closeText(), modal: () => this.layer !== 'document',
        }, event => { this.dismiss('close-button', event) }, event => this.handleCancel(event), event => this.handleBackdrop(event), actions)
        return this.view.root
    }
    protected dialogElement(): HTMLDialogElement | undefined { return this.view?.dialog }
    protected syncDialog(): void {
        this.setAttribute('modal-size', ['sm', 'md', 'lg', 'full', 'page'].includes(this.modalSize) ? this.modalSize : 'md')
        this.dataset.layer = this.layer === 'document' ? 'document' : 'top'
    }
}
export { ModalBase };
export type { ModalProps, ModalSize, ModalLayer, ModalCloseReason } from './ModalBase.js';
export { showModal, hideModal, closeAllModals, configureModalHost, getModalHost, type ModalRequest, type ModalResult, type ModalAction, type ModalActionContext, type ModalContent, type ModalHandle, type ModalHostOptions } from './service.js';

register('cb-modal', Modal)
