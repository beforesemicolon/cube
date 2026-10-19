import { html, repeat, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { RovingFocus } from '../../core/roving.js'
import { scalarText } from '../../core/value.js'
import { SegmentedControlBase } from './SegmentedControlBase.js'
const css = editorCSS + `:host{display:inline-block}[part=group]{display:flex;align-items:stretch;padding:2px;border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface-muted,#f5f6f5)}:host([data-stacked]) [part=group]{flex-direction:column}[part=item]{display:inline-flex;align-items:center;justify-content:center;gap:var(--spacing-xs,4px);min-block-size:24px;padding:3px 8px;border:0;background:transparent}[part=item][aria-checked=true]{background:var(--color-surface,#fff);color:var(--color-signal-text,#1d50b3);box-shadow:0 1px 3px rgba(12,18,24,.14)}[part=icon]{inline-size:14px;block-size:14px}`;
export class SegmentedControl extends SegmentedControlBase {
    private readonly roving = new RovingFocus(() => [...this.contentRoot.querySelectorAll<HTMLElement>('cb-button[role=radio]:not([disabled])')], () => this.navigationAxis)
    private selected(): string { return this.choices.some(item => item.id === scalarText(this.value)) ? scalarText(this.value) : this.choices.find(item => !item.disabled)?.id ?? '' }
    render(): Template {
        return html`<style part="styles">${css}</style>
            <div part="group" role="radiogroup" aria-orientation="${() => this.navigationAxis}" aria-label="${this.accessibleName}"
                onkeydown="${(event: KeyboardEvent) => this.roving.keydown(event)}">
                ${repeat(() => this.choices, item => html`<cb-button part="item" exportparts="control:item-control,label:item-label,button-label:item-label,icon:item-icon,description:item-description" data-bare data-semantic-host role="radio"
                    data-label="${item.label}" label="${item.label}" accessible-label="${item.label}"
                    icon="${item.icon ?? ''}" disabled="${() => this.unavailable || item.disabled}"
                    aria-checked="${() => String(item.id === this.selected())}" tabindex="${() => item.id === this.selected() ? 0 : -1}"
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
