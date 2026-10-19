import { when, css as componentStyles, html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'

import type { NormalizedItem } from '../../core/items.js'
import { DropdownBase } from './DropdownBase.js'
const css = editorCSS + `:host{display:inline-block}[part=popup]{z-index:var(--z-index-dropdown,40);inline-size:max-content;box-sizing:border-box;max-inline-size:100%;padding:0;border:0;background:transparent;overflow:auto}`;
export class Dropdown extends DropdownBase {
    stylesheet = componentStyles`${css}`

    protected triggerElement(): HTMLElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLElement ? node : undefined }
    protected popupElement(): HTMLElement | undefined { const node = this.refs.popup?.[0]; return node instanceof HTMLElement ? node : undefined }
    render(): Template {
        return html`

            <cb-button ref="trigger" part="trigger" exportparts="control:trigger-control,label:trigger-label,icon:trigger-icon,spinner:trigger-spinner"
                label="${this.props.label}" icon="${this.props.icon}" loading="${this.props.loading}"
                accessible-label="${this.accessibleName}" disabled="${() => this.unavailable}"
                aria-haspopup="menu" aria-expanded="${when(this.props.open, 'true', 'false')}"
                onbeforeaction="${(event: Event) => event.stopPropagation()}"
                onaction="${(event: Event) => { event.stopPropagation(); this.toggle() }}"></cb-button>
            <div ref="popup" part="popup" hidden>
                <cb-menu part="menu" items="${this.props.items}" disabled="${() => this.unavailable}" accessible-label="${this.accessibleName}"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: CustomEvent<{ item: NormalizedItem }>) => { event.stopPropagation(); if (this.select(event.detail.item, event)) this.setOpen(false) }}"></cb-menu>
            </div>`
    }
}
export { DropdownBase };
export type { DropdownProps } from './DropdownBase.js';
