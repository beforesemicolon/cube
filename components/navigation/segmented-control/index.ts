import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { RovingFocus } from '../../core/roving.js';
import { scalarText } from '../../core/value.js';
import { createIcon, iconPaths } from '../../icons/paths.js';
import { actionLabel, createBareButton } from '../../action/create.js';
import { SegmentedControlBase } from './SegmentedControlBase.js';
export class SegmentedControl extends SegmentedControlBase {
    private group?: HTMLElement;
    private roving?: RovingFocus;
    render(): Template {
        this.group = element('div', { attributes: { part: 'group' } }) as HTMLDivElement;
        this.group.setAttribute('role', 'radiogroup');
        this.roving = new RovingFocus(() => Array.from(this.group?.querySelectorAll<HTMLElement>('cb-button[role=radio]:not([disabled])') ?? []), () => this.navigationAxis);
        this.group.addEventListener('keydown', event => this.roving?.keydown(event));
        return html`<style part="styles">${editorCSS + `:host{display:inline-block}[part=group]{display:flex;align-items:stretch;padding:2px;border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface-muted,#f5f6f5)}:host([data-stacked]) [part=group]{flex-direction:column}[part=item]{display:inline-flex;align-items:center;justify-content:center;gap:var(--spacing-xs,4px);min-block-size:24px;padding:3px 8px;border:0;background:transparent}[part=item][aria-checked=true]{background:var(--color-surface,#fff);color:var(--color-signal-text,#1d50b3);box-shadow:0 1px 3px rgba(12,18,24,.14)}[part=icon]{inline-size:14px;block-size:14px}`}</style>${this.group}`;
    }
    protected syncView(): void {
        if (!this.group)
            return;
        const choices = this.choices;
        const selected = choices.some(item => item.id === scalarText(this.value)) ? scalarText(this.value) : choices.find(item => !item.disabled)?.id ?? '';
        if (!scalarText(this.value) && selected)
            this.value = selected;
        this.toggleAttribute('data-stacked', this.navigationAxis === 'vertical');
        this.group.setAttribute('aria-orientation', this.navigationAxis);
        this.group.setAttribute('aria-label', this.accessibleName());
        this.group.replaceChildren(...choices.map(item => {
            const control = createBareButton('item', event => this.choose(item, event));
            actionLabel(control, item.label);
            control.dataset.label = item.label;
            control.disabled = this.unavailable || item.disabled;
            control.setAttribute('role', 'radio');
            control.setAttribute('aria-checked', String(item.id === selected));
            if (item.icon && Object.hasOwn(iconPaths, item.icon))
                control.append(createIcon(item.icon));
            control.append(element('span', { attributes: { part: 'item-label' }, textContent: item.label }) as HTMLSpanElement);
            return control;
        }));
        const index = Math.max(0, choices.findIndex(item => item.id === selected && !item.disabled));
        this.roving?.reset(index);
    }
}
export { SegmentedControlBase };
export type { SegmentedControlProps } from './SegmentedControlBase.js';
