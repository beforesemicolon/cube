import type { Button } from '../button/index.js'
import type { IconButton } from '../icon-button/index.js'
import type { Menu } from '../../navigation/menu/index.js'
import '../button/index.js'
import '../icon-button/index.js'
import '../../navigation/menu/index.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { SplitButtonBase } from './SplitButtonBase.js'

export class SplitButton extends SplitButtonBase {
    private group?: HTMLElement
    private primary?: Button
    private trigger?: IconButton
    private popup?: HTMLElement
    private menu?: Menu
    render(): Node {
        this.group = el('div', 'group'); this.group.setAttribute('role', 'group')
        this.primary = document.createElement('cb-button') as Button; this.primary.setAttribute('part', 'primary'); this.primary.setAttribute('exportparts', 'control:primary-control,label:primary-label,icon:primary-icon,spinner:primary-spinner'); this.primary.addEventListener('cb-before-action', event => event.stopPropagation()); this.primary.addEventListener('cb-action', event => { event.stopPropagation(); this.activatePrimary(event) })
        this.trigger = document.createElement('cb-icon-button') as IconButton; this.trigger.setAttribute('part', 'trigger'); this.trigger.setAttribute('exportparts', 'control:trigger-control,label:trigger-label,icon:trigger-icon,spinner:trigger-spinner'); this.trigger.addEventListener('cb-before-action', event => event.stopPropagation()); this.trigger.addEventListener('cb-action', event => { event.stopPropagation(); this.toggle() })
        this.group.append(this.primary, this.trigger)
        this.popup = el('div', 'popup'); this.popup.hidden = true
        this.menu = document.createElement('cb-menu') as Menu; this.menu.setAttribute('part', 'menu'); this.menu.addEventListener('cb-before-action', event => event.stopPropagation()); this.menu.addEventListener('cb-action', event => { event.stopPropagation(); this.emit('cb-action', { ...(event as CustomEvent).detail, source: 'menu' }); this.setOpen(false) })
        this.popup.append(this.menu)
        return fragment(sheet(editorCSS + `
:host{display:inline-block}
[part=group]{display:flex;align-items:stretch}
[part=primary]{--component-button-radius-start-end:0;--component-button-radius-end-end:0}
[part=trigger]{position:relative;margin-inline-start:-1px;--component-button-radius-start-start:0;--component-button-radius-end-start:0}
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
        Object.assign(this.trigger, { icon: 'down', accessibleLabel: scalarText(this.menuLabel), disabled: this.unavailable, variant: 'primary', popupType: 'menu', popupExpanded: bool(this.open) })
        Object.assign(this.menu, { items: this.items, disabled: this.unavailable, accessibleLabel: scalarText(this.menuLabel) })
    }
}

register('cb-split-button', SplitButton)
export { SplitButtonBase }
export type { SplitButtonProps } from './SplitButtonBase.js'
