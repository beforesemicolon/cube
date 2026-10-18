import type { Button } from '../button/index.js'
import '../button/index.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { scalarText } from '../../core/value.js'
import { ButtonGroupBase } from './ButtonGroupBase.js'

export class ButtonGroup extends ButtonGroupBase {
    private group?: HTMLElement
    render(): Node {
        this.group = el('div', 'group')
        this.group.setAttribute('role', 'group')
        return fragment(sheet(editorCSS + `
:host{display:inline-block}
[part=group]{display:flex;align-items:stretch}
[part=item]{position:relative;--component-button-radius-start-start:0;--component-button-radius-start-end:0;--component-button-radius-end-end:0;--component-button-radius-end-start:0}
[part=item]:not(:first-child){margin-inline-start:-1px}
[part=item]:first-child{--component-button-radius-start-start:var(--radius-sm,6px);--component-button-radius-end-start:var(--radius-sm,6px)}
[part=item]:last-child{--component-button-radius-start-end:var(--radius-sm,6px);--component-button-radius-end-end:var(--radius-sm,6px)}
[part=item]:focus-within{z-index:1}
:host([data-orientation=vertical]) [part=group]{flex-direction:column}
:host([data-orientation=vertical]) [part=item]{margin-inline-start:0;margin-block-start:-1px;--component-button-radius-start-start:0;--component-button-radius-start-end:0;--component-button-radius-end-end:0;--component-button-radius-end-start:0}
:host([data-orientation=vertical]) [part=item]:first-child{margin-block-start:0;--component-button-radius-start-start:var(--radius-sm,6px);--component-button-radius-start-end:var(--radius-sm,6px)}
:host([data-orientation=vertical]) [part=item]:last-child{--component-button-radius-end-start:var(--radius-sm,6px);--component-button-radius-end-end:var(--radius-sm,6px)}
`), this.group)
    }
    protected syncView(): void {
        if (!this.group) return
        const orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal'
        this.dataset.orientation = orientation
        const label = scalarText(this.accessibleLabel) || scalarText(this.label)
        if (label) this.group.setAttribute('aria-label', label); else this.group.removeAttribute('aria-label')
        this.group.replaceChildren(...this.actions.map(item => {
            const button = document.createElement('cb-button') as Button
            button.setAttribute('part', 'item')
            button.setAttribute('exportparts', 'control:item-control,label:item-label,icon:item-icon,spinner:item-spinner')
            Object.assign(button, {
                label: item.label,
                description: item.description,
                value: item.id,
                icon: item.icon ?? '',
                disabled: this.unavailable || item.disabled,
                size: this.size,
                variant: this.variant,
            })
            button.addEventListener('cb-before-action', event => event.stopPropagation())
            button.addEventListener('cb-action', event => { event.stopPropagation(); this.activate(item, event) })
            return button
        }))
    }
}

register('cb-button-group', ButtonGroup)
export { ButtonGroupBase }
export type { ButtonGroupProps } from './ButtonGroupBase.js'
