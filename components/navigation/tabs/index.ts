import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import { is, or, pick, html, repeat, when, type Template } from '../../core/runtime.js'

import { RovingFocus } from '../../core/roving.js'
import { scalarText } from '../../core/value.js'
import { TabsBase } from './TabsBase.js'

export class Tabs extends TabsBase {
    stylesheet = componentStylesheet

    private readonly roving = new RovingFocus(() => elementRefs(this.refs.items).filter(node => !node.hasAttribute('disabled')), () => this.navigationAxis, index => {
        if (this.activation === 'automatic') elementRefs(this.refs.items).filter(node => !node.hasAttribute('disabled'))[index]?.click()
    })
    private selected(): string { return this.choices.some(item => item.id === scalarText(this.value)) ? scalarText(this.value) : this.choices.find(item => !item.disabled)?.id ?? '' }
    render(): Template {
        return html`
            <div part="tablist" role="tablist" aria-orientation="${() => this.navigationAxis}" aria-label="${this.accessibleName}"
                onkeydown="${(event: KeyboardEvent) => this.roving.keydown(event)}">
                ${repeat(() => this.choices, item => {
                    const source = () => this.items.find(candidate => scalarText(candidate.id) === item.id)
                    return html`<div part="tab-item">
                        <cb-button ref="items" part="tab" exportparts="control:tab-control,label:tab-label,button-label:tab-label,icon:tab-icon,description:tab-description" data-bare data-semantic-host role="tab" data-label="${item.label}" label="${item.label}"
                            accessible-label="${item.label}" disabled="${or(() => this.unavailable, item.disabled)}"
                            aria-selected="${when(is(() => item.id === this.selected()), 'true', 'false')}" tabindex="${() => item.id === this.selected() ? 0 : -1}"
                            id="${() => (this.id || 'cb-tabs') + '-' + item.id + '-tab'}"
                            aria-controls="${() => (this.id || 'cb-tabs') + '-' + item.id + '-panel'}"
                            onbeforeaction="${(event: Event) => event.stopPropagation()}"
                            onaction="${(event: Event) => this.choose(item, event)}"></cb-button>
                        ${when(pick(source, "dirty"), html`<span part="dirty" aria-hidden="true"></span>`)}
                        ${when(pick(source, "closable"), html`<cb-button part="close" exportparts="control:close-control,label:close-label,button-label:close-label,icon:close-icon,description:close-description" icon="close" icon-only="true" variant="ghost" size="xs"
                            accessible-label="${() => scalarText(this.closeLabel).replaceAll('{tab}', item.label)}" disabled="${or(() => this.unavailable, item.disabled)}"
                            onbeforeaction="${(event: Event) => event.stopPropagation()}"
                            onaction="${(event: Event) => { const tab = source(); if (tab) this.closeTab(tab, event) }}"></cb-button>`)}
                    </div>`
                }, { key: item => item.id })}
            </div>`
    }
    protected syncView(): void {
        if (!scalarText(this.value) && this.selected()) this.value = this.selected()
        this.toggleAttribute('data-stacked', this.navigationAxis === 'vertical')
    }
}
export { TabsBase };
export type { TabsProps, TabItem } from './TabsBase.js';
