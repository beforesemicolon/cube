import { html, repeat, when, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { RovingFocus } from '../../core/roving.js'
import { scalarText } from '../../core/value.js'
import { TabsBase } from './TabsBase.js'
const css = editorCSS + `:host{display:block}[part=tablist]{display:flex;align-items:flex-end;gap:var(--spacing-lg,16px);border-block-end:1px solid var(--color-separator,#dae0e4);overflow:auto}:host([data-stacked]) [part=tablist]{flex-direction:column;align-items:stretch;border-block-end:0;border-inline-end:1px solid var(--color-separator,#dae0e4)}[part=tab-item]{position:relative;display:flex;align-items:center;min-inline-size:0}[part=tab]{position:relative;min-block-size:32px;padding:4px 2px;border:0;border-radius:0;background:transparent;color:var(--color-muted-foreground,#606b73);overflow:hidden;text-overflow:ellipsis}[part=tab][aria-selected=true]{color:var(--color-foreground,#20262b)}[part=tab][aria-selected=true]::after{content:'';position:absolute;inset-inline:0;inset-block-end:-1px;block-size:2px;background:var(--color-primary,#2563eb)}[part=dirty]{inline-size:6px;block-size:6px;border-radius:50%;background:var(--color-warning);flex:none}[part=close]{margin-inline-start:2px}:host([data-stacked]) [part=tab-item]{inline-size:100%}:host([data-stacked]) [part=tab]{flex:1;text-align:start}:host([data-stacked]) [part=tab][aria-selected=true]::after{inset-inline-start:auto;inset-inline-end:-1px;inset-block:0;inline-size:2px;block-size:auto}`;
export class Tabs extends TabsBase {
    private readonly roving = new RovingFocus(() => [...this.contentRoot.querySelectorAll<HTMLElement>('cb-button[role=tab]:not([disabled])')], () => this.navigationAxis, index => {
        if (this.activation === 'automatic') this.contentRoot.querySelectorAll<HTMLElement>('cb-button[role=tab]:not([disabled])')[index]?.click()
    })
    private selected(): string { return this.choices.some(item => item.id === scalarText(this.value)) ? scalarText(this.value) : this.choices.find(item => !item.disabled)?.id ?? '' }
    render(): Template {
        return html`<style part="styles">${css}</style>
            <div part="tablist" role="tablist" aria-orientation="${() => this.navigationAxis}" aria-label="${() => this.accessibleName()}"
                onkeydown="${(event: KeyboardEvent) => this.roving.keydown(event)}">
                ${repeat(() => this.choices, item => {
                    const source = () => this.items.find(candidate => scalarText(candidate.id) === item.id)
                    return html`<div part="tab-item">
                        <cb-button part="tab" exportparts="control:tab-control,label:tab-label,button-label:tab-label,icon:tab-icon,description:tab-description" data-bare data-semantic-host role="tab" data-label="${item.label}" label="${item.label}"
                            accessible-label="${item.label}" disabled="${() => this.unavailable || item.disabled}"
                            aria-selected="${() => String(item.id === this.selected())}" tabindex="${() => item.id === this.selected() ? 0 : -1}"
                            id="${() => (this.id || 'cb-tabs') + '-' + item.id + '-tab'}"
                            aria-controls="${() => (this.id || 'cb-tabs') + '-' + item.id + '-panel'}"
                            onaction="${(event: Event) => this.choose(item, event)}"></cb-button>
                        ${when(() => source()?.dirty, html`<span part="dirty" aria-hidden="true"></span>`)}
                        ${when(() => source()?.closable, html`<cb-button part="close" exportparts="control:close-control,label:close-label,button-label:close-label,icon:close-icon,description:close-description" icon="close" icon-only="true" variant="ghost" size="xs"
                            accessible-label="${() => scalarText(this.closeLabel).replaceAll('{tab}', item.label)}" disabled="${() => this.unavailable || item.disabled}"
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
