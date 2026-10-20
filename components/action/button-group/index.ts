import componentStylesheet from './styles.css?inline'
import { or, html, repeat, type Template } from '../../core/runtime.js'

import { ButtonGroupBase } from './ButtonGroupBase.js'

export class ButtonGroup extends ButtonGroupBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`
            <div part="group" role="group" aria-label="${() => this.accessibleName() || null}">
                ${repeat(() => this.actions, item => html`<cb-button part="item" exportparts="control:item-control,label:item-label,icon:item-icon,spinner:item-spinner"
                    label="${item.label}" description="${item.description}" value="${item.id}" icon="${item.icon ?? ''}"
                    disabled="${or(() => this.unavailable, item.disabled)}" size="${this.props.size}" variant="${this.props.variant}"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.activate(item, event) }}"></cb-button>`, { key: item => item.id })}
            </div>`
    }
}
export { ButtonGroupBase };
export type { ButtonGroupProps } from './ButtonGroupBase.js';
