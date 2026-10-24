import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, html, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js'

import { DrawerBase } from './DrawerBase.js'

export class Drawer extends DrawerBase {
    stylesheet = componentStylesheet

    private readonly headingId = uid('cb-drawer-heading')
    private readonly descriptionId = uid('cb-drawer-description')
    render(): Template {
        return html`
            <dialog ref="dialog" part="dialog drawer" aria-labelledby="${this.headingId}" aria-describedby="${this.descriptionId}"
                oncancel="${this.handleCancel}" onclick="${this.handleBackdrop}">

                <header part="header"><div part="copy">
                    <slot name="heading" part="heading" id="${this.headingId}">${this.props.heading}</slot>
                    <slot name="description" part="description" id="${this.descriptionId}" hidden="${isNot(this.props.description)}">${this.props.description}</slot>
                </div><cb-button part="close" exportparts="control:close-control,label:close-label,button-label:close-label,icon:close-icon,description:close-description" variant="ghost" icon="close" icon-only="true" hidden="${isNot(this.props.dismissible)}"
                    accessible-label="${this.closeText}" onaction="${(event: Event) => { event.stopPropagation(); this.dismiss('close-button', event) }}"></cb-button></header>
                <section part="body"><slot part="content"></slot></section>
                <footer part="footer"><slot name="footer" part="footer-content"></slot></footer>
            </dialog>`
    }
    protected dialogElement(): HTMLDialogElement | undefined { const node = this.refs.dialog?.[0]; return node instanceof HTMLDialogElement ? node : undefined }
    protected syncDialog(): void { this.dataset.placement = this.placement === 'start' ? 'start' : 'end' }
}
export { DrawerBase };
export type { DrawerProps } from './DrawerBase.js';

register('cb-drawer', Drawer)
