import { html, repeat, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { ButtonGroupBase } from './ButtonGroupBase.js'
const css = editorCSS + `
:host{display:inline-block}
[part=group]{display:flex;align-items:stretch}
[part=item]{position:relative;--component-button-radius-start-start:0;--component-button-radius-start-end:0;--component-button-radius-end-end:0;--component-button-radius-end-start:0}
[part=item]:not(:first-child){margin-inline-start:-1px}
[part=item]:first-child{--component-button-radius-start-start:var(--radius-sm,6px);--component-button-radius-end-start:var(--radius-sm,6px)}
[part=item]:last-child{--component-button-radius-start-end:var(--radius-sm,6px);--component-button-radius-end-end:var(--radius-sm,6px)}
[part=item]:focus-within{z-index:1}
`;
export class ButtonGroup extends ButtonGroupBase {
    render(): Template {
        return html`<style part="styles">${css}</style>
            <div part="group" role="group" aria-label="${() => this.accessibleName() || null}">
                ${repeat(() => this.actions, item => html`<cb-button part="item" exportparts="control:item-control,label:item-label,icon:item-icon,spinner:item-spinner"
                    label="${item.label}" description="${item.description}" value="${item.id}" icon="${item.icon ?? ''}"
                    disabled="${() => this.unavailable || item.disabled}" size="${() => this.size}" variant="${() => this.variant}"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.activate(item, event) }}"></cb-button>`, { key: item => item.id })}
            </div>`
    }
}
export { ButtonGroupBase };
export type { ButtonGroupProps } from './ButtonGroupBase.js';
