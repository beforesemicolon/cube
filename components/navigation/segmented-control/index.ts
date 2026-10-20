import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import { when, is, or, html, repeat, type Template } from '../../core/runtime.js'

import { RovingFocus } from '../../core/roving.js'
import { scalarText } from '../../core/value.js'
import { SegmentedControlBase } from './SegmentedControlBase.js'

export class SegmentedControl extends SegmentedControlBase {
    stylesheet = componentStylesheet

    private readonly roving = new RovingFocus(() => elementRefs(this.refs.items).filter(node => !node.hasAttribute('disabled')), () => this.navigationAxis)
    private selected(): string { return this.choices.some(item => item.id === scalarText(this.value)) ? scalarText(this.value) : this.choices.find(item => !item.disabled)?.id ?? '' }
    render(): Template {
        return html`
            <div part="group" role="radiogroup" aria-orientation="${() => this.navigationAxis}" aria-label="${this.accessibleName}"
                onkeydown="${(event: KeyboardEvent) => this.roving.keydown(event)}">
                ${repeat(() => this.choices, item => html`<cb-button ref="items" part="item" exportparts="control:item-control,label:item-label,button-label:item-label,icon:item-icon,description:item-description" data-bare data-semantic-host role="radio"
                    data-label="${item.label}" label="${item.label}" accessible-label="${item.label}"
                    icon="${item.icon ?? ''}" disabled="${or(() => this.unavailable, item.disabled)}"
                    aria-checked="${when(is(() => item.id === this.selected()), 'true', 'false')}" tabindex="${() => item.id === this.selected() ? 0 : -1}"
                    onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: Event) => this.choose(item, event)}"></cb-button>`, { key: item => item.id })}
            </div>`
    }
    protected syncView(): void {
        if (!scalarText(this.value) && this.selected()) this.value = this.selected()
        this.toggleAttribute('data-stacked', this.navigationAxis === 'vertical')
    }
}
export { SegmentedControlBase };
export type { SegmentedControlProps } from './SegmentedControlBase.js';
