import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { scalarText } from '../../core/value.js'
import { ButtonGroupBase } from './ButtonGroupBase.js'

export class ButtonGroup extends ButtonGroupBase {
    private group?: HTMLElement
    render(): Node {
        this.group = el('div', 'group')
        this.group.setAttribute('role', 'group')
        this.group.append(slot('', '', 'content'))
        return fragment(sheet(editorCSS + `:host{display:inline-block}[part=group]{display:flex;align-items:stretch}:host([data-orientation=vertical]) [part=group]{flex-direction:column}::slotted(cb-button:not(:first-child)),::slotted(cb-icon-button:not(:first-child)){margin-inline-start:-1px}:host([data-orientation=vertical]) ::slotted(cb-button:not(:first-child)){margin-inline-start:0;margin-block-start:-1px}`), this.group)
    }
    protected syncView(): void {
        if (!this.group) return
        const orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal'
        this.dataset.orientation = orientation
        this.group.setAttribute('aria-orientation', orientation)
        const label = scalarText(this.accessibleLabel) || scalarText(this.label)
        if (label) this.group.setAttribute('aria-label', label); else this.group.removeAttribute('aria-label')
        this.group.setAttribute('aria-disabled', String(this.unavailable))
    }
}

register('cb-button-group', ButtonGroup)
export { ButtonGroupBase }
export type { ButtonGroupProps } from './ButtonGroupBase.js'
