import '../number-input/index.js'
import '../../action/button/index.js'
import type { NumberInput } from '../number-input/index.js'
import type { Button } from '../../action/button/index.js'
import { actionLabel } from '../../action/create.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { bool, finite, scalarText } from '../../core/value.js'
import { LinkedValuesBase } from './LinkedValuesBase.js'

const css = editorCSS + `
:host{display:block;inline-size:min(100%,var(--component-linked-values-width,420px));max-inline-size:100%}[part~=group]{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:end;gap:var(--spacing-xs,4px);inline-size:100%;min-inline-size:0}
[part~=value-field]{display:grid;gap:var(--spacing-xs,4px);min-inline-size:0}[part~=value-label]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px);font-weight:600}
[part~=first],[part~=second]{display:block;min-inline-size:0;--component-studio-control-width:100%}[part~=link]{margin-block-end:1px}
@container(max-width:300px){[part~=group]{grid-template-columns:minmax(0,1fr) auto}[part~=second-field]{grid-column:1}[part~=link]{grid-column:2;grid-row:1/3;align-self:center}}
`
export class LinkedValues extends LinkedValuesBase {
    private group?: HTMLElement
    private firstLabelNode?: HTMLElement
    private secondLabelNode?: HTMLElement
    private first?: NumberInput
    private second?: NumberInput
    private link?: Button
    render(): Node {
        this.group = el('div', 'group')
        this.group.setAttribute('role', 'group')
        this.first = document.createElement('cb-number-input') as NumberInput; this.first.setAttribute('part', 'first')
        this.second = document.createElement('cb-number-input') as NumberInput; this.second.setAttribute('part', 'second')
        const firstField = el('label', 'value-field first-field')
        const secondField = el('label', 'value-field second-field')
        this.firstLabelNode = el('span', 'value-label first-label')
        this.secondLabelNode = el('span', 'value-label second-label')
        this.firstLabelNode.addEventListener('click', () => this.first?.focus())
        this.secondLabelNode.addEventListener('click', () => this.second?.focus())
        firstField.append(this.firstLabelNode, this.first)
        secondField.append(this.secondLabelNode, this.second)
        this.link = document.createElement('cb-button') as Button; this.link.setAttribute('part', 'link')
        this.first.addEventListener('cb-change', event => this.setFirst(finite((event as CustomEvent<{ value: number }>).detail.value), event))
        this.second.addEventListener('cb-change', event => this.setSecond(finite((event as CustomEvent<{ value: number }>).detail.value), event))
        this.link.addEventListener('cb-change', event => this.setLinked(bool((event as CustomEvent<{ pressed: boolean }>).detail.pressed), event))
        this.group.append(firstField, this.link, secondField)
        return fragment(sheet(css), this.group)
    }
    protected syncView(): void {
        if (!this.group || !this.firstLabelNode || !this.secondLabelNode || !this.first || !this.second || !this.link) return
        this.group.setAttribute('aria-label', this.accessibleName())
        this.firstLabelNode.textContent = scalarText(this.firstLabel)
        this.secondLabelNode.textContent = scalarText(this.secondLabel)
        Object.assign(this.first, { label: scalarText(this.firstLabel), accessibleLabel: scalarText(this.firstLabel), value: finite(this.firstValue), min: this.min, max: this.max, step: this.step, disabled: this.unavailable })
        Object.assign(this.second, { label: scalarText(this.secondLabel), accessibleLabel: scalarText(this.secondLabel), value: finite(this.secondValue), min: this.min, max: this.max, step: this.step, disabled: this.unavailable })
        Object.assign(this.link, { label: '', accessibleLabel: this.toggleLabel(), pressed: bool(this.linked), icon: bool(this.linked) ? 'link' : 'unlink', disabled: this.unavailable })
        actionLabel(this.link, this.toggleLabel())
        this.syncFormValues()
    }
    focus(options?: FocusOptions): void { this.first?.focus(options) }
}
register('cb-linked-values', LinkedValues)
export { LinkedValuesBase }
export type { LinkedValuesProps } from './LinkedValuesBase.js'
