import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { RovingFocus } from '../../core/roving.js'
import { scalarText } from '../../core/value.js'
import { createIcon, iconPaths } from '../../icons/paths.js'
import { SegmentedControlBase } from './SegmentedControlBase.js'

export class SegmentedControl extends SegmentedControlBase {
    private group?: HTMLElement
    private roving?: RovingFocus
    render(): Node {
        this.group = el('div', 'group')
        this.group.setAttribute('role', 'radiogroup')
        this.roving = new RovingFocus(() => Array.from(this.group?.querySelectorAll<HTMLButtonElement>('[role=radio]:not(:disabled)') ?? []), () => this.orientation ?? 'horizontal')
        this.group.addEventListener('keydown', event => this.roving?.keydown(event))
        return fragment(sheet(editorCSS + `:host{display:inline-block}[part=group]{display:flex;align-items:stretch;padding:2px;border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface-muted,#f5f6f5)}:host([data-orientation=vertical]) [part=group]{flex-direction:column}[part=item]{display:inline-flex;align-items:center;justify-content:center;gap:var(--spacing-xs,4px);min-block-size:24px;padding:3px 8px;border:0;background:transparent}[part=item][aria-checked=true]{background:var(--color-surface,#fff);color:var(--color-signal-text,#1d50b3);box-shadow:0 1px 3px rgba(12,18,24,.14)}[part=icon]{inline-size:14px;block-size:14px}`), this.group)
    }
    protected syncView(): void {
        if (!this.group) return
        const choices = this.choices
        const selected = choices.some(item => item.id === scalarText(this.value)) ? scalarText(this.value) : choices.find(item => !item.disabled)?.id ?? ''
        if (!scalarText(this.value) && selected) this.value = selected
        this.dataset.orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal'
        this.group.setAttribute('aria-orientation', this.dataset.orientation)
        this.group.setAttribute('aria-label', this.accessibleName('choices'))
        this.group.replaceChildren(...choices.map(item => {
            const control = el('button', 'item')
            control.type = 'button'; control.dataset.label = item.label; control.disabled = this.unavailable || item.disabled
            control.setAttribute('role', 'radio'); control.setAttribute('aria-checked', String(item.id === selected))
            if (item.icon && Object.hasOwn(iconPaths, item.icon)) control.append(createIcon(item.icon))
            control.append(el('span', 'item-label', item.label))
            control.addEventListener('click', event => this.choose(item, event))
            return control
        }))
        const index = Math.max(0, choices.findIndex(item => item.id === selected && !item.disabled)); this.roving?.reset(index)
    }
}

register('cb-segmented-control', SegmentedControl)
export { SegmentedControlBase }
export type { SegmentedControlProps } from './SegmentedControlBase.js'
