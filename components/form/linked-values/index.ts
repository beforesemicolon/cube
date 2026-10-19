import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import type { NumberInput } from '../number-input/index.js';
import type { Button } from '../../action/button/index.js';
import { actionLabel } from '../../action/create.js';
import { bool, finite, scalarText } from '../../core/value.js';
import { LinkedValuesBase } from './LinkedValuesBase.js';
const css = editorCSS + `
:host{display:block;inline-size:var(--component-linked-values-width,420px);max-inline-size:100%;min-inline-size:min(100%,var(--component-linked-values-min-width,320px))}[part~=group]{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:end;gap:var(--spacing-xs,4px);inline-size:100%;min-inline-size:0}
[part~=value-field]{display:grid;gap:var(--spacing-xs,4px);min-inline-size:0}[part~=value-label]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px);font-weight:600}
[part~=first],[part~=second]{display:block;min-inline-size:0;--component-studio-control-width:100%;--component-studio-control-min-width:0px}[part~=link]{margin-block-end:1px}
@container(max-width:300px){[part~=group]{grid-template-columns:minmax(0,1fr) auto}[part~=second-field]{grid-column:1}[part~=link]{grid-column:2;grid-row:1/3;align-self:center}}
`;
export class LinkedValues extends LinkedValuesBase {
    private group?: HTMLElement;
    private firstLabelNode?: HTMLElement;
    private secondLabelNode?: HTMLElement;
    private first?: NumberInput;
    private second?: NumberInput;
    private link?: Button;
    render(): Template {
        this.group = element('div', { attributes: { part: 'group' } }) as HTMLDivElement;
        this.group.setAttribute('role', 'group');
        this.first = document.createElement('cb-number-input') as NumberInput;
        this.first.setAttribute('part', 'first');
        this.second = document.createElement('cb-number-input') as NumberInput;
        this.second.setAttribute('part', 'second');
        const firstField = element('label', { attributes: { part: 'value-field first-field' } }) as HTMLLabelElement;
        const secondField = element('label', { attributes: { part: 'value-field second-field' } }) as HTMLLabelElement;
        this.firstLabelNode = element('span', { attributes: { part: 'value-label first-label' } }) as HTMLSpanElement;
        this.secondLabelNode = element('span', { attributes: { part: 'value-label second-label' } }) as HTMLSpanElement;
        this.firstLabelNode.addEventListener('click', () => this.first?.focus());
        this.secondLabelNode.addEventListener('click', () => this.second?.focus());
        firstField.append(this.firstLabelNode, this.first);
        secondField.append(this.secondLabelNode, this.second);
        this.link = document.createElement('cb-button') as Button;
        this.link.setAttribute('part', 'link');
        this.first.addEventListener('change', event => this.setFirst(finite((event as CustomEvent<{
            value: number;
        }>).detail.value), event));
        this.second.addEventListener('change', event => this.setSecond(finite((event as CustomEvent<{
            value: number;
        }>).detail.value), event));
        this.link.addEventListener('change', event => this.setLinked(bool((event as CustomEvent<{
            pressed: boolean;
        }>).detail.pressed), event));
        this.group.append(firstField, this.link, secondField);
        return html`<style part="styles">${css}</style>${this.group}`;
    }
    protected syncView(): void {
        if (!this.group || !this.firstLabelNode || !this.secondLabelNode || !this.first || !this.second || !this.link)
            return;
        this.group.setAttribute('aria-label', this.accessibleName());
        this.firstLabelNode.textContent = scalarText(this.firstLabel);
        this.secondLabelNode.textContent = scalarText(this.secondLabel);
        Object.assign(this.first, { label: scalarText(this.firstLabel), accessibleLabel: scalarText(this.firstLabel), value: finite(this.firstValue), min: this.min, max: this.max, step: this.step, disabled: this.unavailable });
        Object.assign(this.second, { label: scalarText(this.secondLabel), accessibleLabel: scalarText(this.secondLabel), value: finite(this.secondValue), min: this.min, max: this.max, step: this.step, disabled: this.unavailable });
        Object.assign(this.link, { label: '', accessibleLabel: this.toggleLabel(), pressed: bool(this.linked), icon: bool(this.linked) ? 'link' : 'unlink', iconOnly: true, variant: 'ghost', disabled: this.unavailable });
        actionLabel(this.link, this.toggleLabel());
        this.syncFormValues();
    }
    focus(options?: FocusOptions): void { this.first?.focus(options); }
}
export { LinkedValuesBase };
export type { LinkedValuesProps } from './LinkedValuesBase.js';
