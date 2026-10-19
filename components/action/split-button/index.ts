import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { bool } from '../../core/value.js'
import type { NormalizedItem } from '../../core/items.js'
import { SplitButtonBase } from './SplitButtonBase.js'
const css = editorCSS + `
:host{display:inline-block}
[part=group]{display:flex;align-items:stretch}
[part=primary]{--component-button-radius-start-end:0;--component-button-radius-end-end:0}
[part=trigger]{position:relative;margin-inline-start:-1px;--component-button-radius-start-start:0;--component-button-radius-end-start:0}
[part=trigger]::part(control){background:var(--color-primary,#2563EB);color:var(--color-primary-foreground,#fff);border-color:transparent}
[part=trigger]::part(control):hover{background:var(--color-primary-hover,#1D50B3)}
[part=primary]:focus-within,[part=trigger]:focus-within{z-index:1}
[part=popup]{z-index:var(--z-index-dropdown,40);inline-size:max-content;box-sizing:border-box;max-inline-size:100%;padding:0;border:0;background:transparent;overflow:auto}
`;
export class SplitButton extends SplitButtonBase {
    protected triggerElement(): HTMLElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLElement ? node : undefined }
    protected popupElement(): HTMLElement | undefined { const node = this.refs.popup?.[0]; return node instanceof HTMLElement ? node : undefined }
    render(): Template {
        return html`<style part="styles">${css}</style>
            <div part="group" role="group" aria-label="${this.accessibleName}">
                <cb-button part="primary" exportparts="control:primary-control,label:primary-label,icon:primary-icon,spinner:primary-spinner"
                    label="${this.props.label}" accessible-label="${this.accessibleName}" disabled="${() => this.unavailable}" loading="${() => bool(this.loading)}" variant="primary"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.activatePrimary(event) }}"></cb-button>
            <cb-button ref="trigger" part="trigger" exportparts="control:trigger-control,label:trigger-label,icon:trigger-icon,spinner:trigger-spinner"
                icon="down" icon-only="true" variant="primary"
                accessible-label="${this.accessibleName}" disabled="${() => this.unavailable}"
                aria-haspopup="menu" aria-expanded="${() => String(bool(this.open))}"
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
