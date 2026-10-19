import type { Button } from '../button/index.js'
import type { Menu } from '../../navigation/menu/index.js'
import '../button/index.js'
import '../../navigation/menu/index.js'
import { register } from '../../core/Component.js'
import type { NormalizedItem } from '../../core/items.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { SplitButtonBase } from './SplitButtonBase.js'

export class SplitButton extends SplitButtonBase {
    private group?: HTMLElement
    private primary?: Button
    private trigger?: Button
    private popup?: HTMLElement
    private menu?: Menu
    render(): Node {
        this.group = el('div', 'group'); this.group.setAttribute('role', 'group')
        this.primary = document.createElement('cb-button') as Button; this.primary.setAttribute('part', 'primary'); this.primary.setAttribute('exportparts', 'control:primary-control,label:primary-label,icon:primary-icon,spinner:primary-spinner'); this.primary.addEventListener('beforeaction', event => event.stopPropagation()); this.primary.addEventListener('action', event => { event.stopPropagation(); this.activatePrimary(event) })
        this.trigger = document.createElement('cb-button') as Button; this.trigger.setAttribute('part', 'trigger'); this.trigger.setAttribute('exportparts', 'control:trigger-control,label:trigger-label,icon:trigger-icon,spinner:trigger-spinner'); this.trigger.addEventListener('beforeaction', event => event.stopPropagation()); this.trigger.addEventListener('action', event => { event.stopPropagation(); this.toggle() })
        this.group.append(this.primary, this.trigger)
        this.popup = el('div', 'popup'); this.popup.hidden = true
        this.menu = document.createElement('cb-menu') as Menu; this.menu.setAttribute('part', 'menu'); this.menu.addEventListener('beforeaction', event => event.stopPropagation()); this.menu.addEventListener('action', event => {
            event.stopPropagation()
            const detail = (event as CustomEvent<{ item: NormalizedItem }>).detail
            if (this.select(detail.item, event)) this.setOpen(false)
        })
        this.popup.append(this.menu)
        return fragment(sheet(editorCSS + `
:host{display:inline-block}
[part=group]{display:flex;align-items:stretch}
[part=primary]{--component-button-radius-start-end:0;--component-button-radius-end-end:0}
[part=trigger]{position:relative;margin-inline-start:-1px;--component-button-radius-start-start:0;--component-button-radius-end-start:0}
[part=trigger]::part(trigger-control){background:var(--color-primary,#2563EB);color:var(--color-primary-foreground,#fff);border-color:transparent}
[part=trigger]::part(trigger-control):hover{background:var(--color-primary-hover,#1D50B3)}
[part=primary]:focus-within,[part=trigger]:focus-within{z-index:1}
[part=popup]{z-index:var(--z-index-dropdown,40);inline-size:max-content;box-sizing:border-box;max-inline-size:100%;padding:0;border:0;background:transparent;overflow:auto}
`), this.group, this.popup)
    }
    protected triggerElement(): HTMLElement | undefined { return this.trigger }
    protected popupElement(): HTMLElement | undefined { return this.popup }
    protected syncView(): void {
        if (!this.group || !this.primary || !this.trigger || !this.menu) return
        this.group.setAttribute('aria-label', this.accessibleName())
        Object.assign(this.primary, { label: scalarText(this.label), accessibleLabel: this.accessibleName(), disabled: this.unavailable, loading: bool(this.loading), variant: 'primary' })
        Object.assign(this.trigger, { icon: 'down', accessibleLabel: this.accessibleName(), disabled: this.unavailable, variant: 'primary', iconOnly: true })
        this.trigger.setAttribute('aria-haspopup', 'menu')
        this.trigger.setAttribute('aria-expanded', String(bool(this.open)))
        Object.assign(this.menu, { items: this.items, disabled: this.unavailable, accessibleLabel: this.accessibleName() })
    }
}

register('cb-split-button', SplitButton)
export { SplitButtonBase }
export type { SplitButtonProps } from './SplitButtonBase.js'
