import { is, isNot, html, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js'
export interface ModalView { root: Template; readonly dialog?: HTMLDialogElement }
interface ModalBindings {
    heading: () => string
    description: () => string
    dismissible: () => boolean
    closeLabel: () => string
    modal: () => boolean
}

export function createModalView(bindings: ModalBindings, onClose: (event: Event) => void, onCancel: (event: Event) => void, onClick: (event: MouseEvent) => void, actions: Template, role = 'dialog'): ModalView {
    const titleId = uid('cb-modal-title')
    const descriptionId = uid('cb-modal-description')
    const root = html`
        <dialog ref="dialog" part="dialog surface" role="${role}" aria-labelledby="${titleId}" aria-describedby="${descriptionId}"
            aria-modal="${is(() => bindings.modal())}" oncancel="${onCancel}" onclick="${onClick}">
            <header part="header"><div part="header-copy">
                <div part="heading" id="${titleId}"><slot name="heading">${bindings.heading}</slot></div>
                <div part="description" id="${descriptionId}" hidden="${isNot(() => bindings.description())}"><slot name="description">${bindings.description}</slot></div>
            </div><cb-button part="close" exportparts="control:close-control,label:close-label,button-label:close-label,icon:close-icon,description:close-description" variant="ghost" icon="close" icon-only="true" hidden="${isNot(() => bindings.dismissible())}"
                accessible-label="${bindings.closeLabel}" onaction="${(event: Event) => { event.stopPropagation(); onClose(event) }}"></cb-button></header>
            <section part="body"><slot part="content"></slot></section>
            <footer part="footer actions">${actions}<slot name="footer" part="footer-content"></slot></footer>
        </dialog>`
    return { root, get dialog() { const node = root.refs.dialog?.[0]; return node instanceof HTMLDialogElement ? node : undefined } }
}
