import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { when, html, type Template } from '../../core/runtime.js'

import type { NormalizedItem } from '../../core/items.js'
import { SplitButtonBase } from './SplitButtonBase.js'

export class SplitButton extends SplitButtonBase {
    stylesheet = componentStylesheet

    protected triggerElement(): HTMLElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLElement ? node : undefined }
    protected popupElement(): HTMLElement | undefined { const node = this.refs.popup?.[0]; return node instanceof HTMLElement ? node : undefined }
    render(): Template {
        return html`
            <div part="group" role="group" aria-label="${this.accessibleName}">
                <cb-button part="primary" exportparts="control:primary-control,label:primary-label,icon:primary-icon,spinner:primary-spinner"
                    label="${this.props.label}" icon=${this.props.icon} icon-src=${this.props.iconSrc} accessible-label="${this.accessibleName}" disabled="${() => this.unavailable}" loading="${this.props.loading}" variant="primary"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.activatePrimary(event) }}"></cb-button>
            <cb-button ref="trigger" part="trigger" exportparts="control:trigger-control,label:trigger-label,icon:trigger-icon,spinner:trigger-spinner"
                icon="down" icon-only="true" variant="primary"
                accessible-label="${this.accessibleName}" disabled="${() => this.unavailable}"
                aria-haspopup="menu" aria-expanded="${when(this.props.open, 'true', 'false')}"
                onbeforeaction="${(event: Event) => event.stopPropagation()}"
                onaction="${(event: Event) => { event.stopPropagation(); this.toggle() }}"></cb-button></div>
            <div ref="popup" part="popup" hidden>
                <cb-menu part="menu" items="${this.props.items}" disabled="${() => this.unavailable}" accessible-label="${this.accessibleName}"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: CustomEvent<{ item: NormalizedItem }>) => { event.stopPropagation(); if (this.select(event.detail.item, event)) this.setOpen(false) }}"></cb-menu>
            </div>`
    }
}
export { SplitButtonBase };
export type { SplitButtonProps } from './SplitButtonBase.js';

register('cb-split-button', SplitButton)
