import type { Button } from '../../action/button/index.js'
import type { Menu } from '../../navigation/menu/index.js'
import '../../action/button/index.js'
import '../../navigation/menu/index.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { DropdownBase } from './DropdownBase.js'

export class Dropdown extends DropdownBase {
    private trigger?: Button
    private popup?: HTMLElement
    private menu?: Menu
    render(): Node {
        this.trigger = document.createElement('cb-button') as Button; this.trigger.setAttribute('part', 'trigger'); this.trigger.setAttribute('exportparts', 'control:trigger-control,label:trigger-label,icon:trigger-icon')
        this.trigger.addEventListener('action', event => { event.stopPropagation(); this.toggle() })
        this.popup = el('div', 'popup'); this.popup.hidden = true
        this.menu = document.createElement('cb-menu') as Menu; this.menu.setAttribute('part', 'menu'); this.menu.addEventListener('action', event => { event.stopPropagation(); this.emit('action', (event as CustomEvent).detail); this.setOpen(false) })
        this.popup.append(this.menu)
        return fragment(sheet(editorCSS + `:host{display:inline-block}[part=popup]{z-index:var(--z-index-dropdown,40);inline-size:max-content;box-sizing:border-box;max-inline-size:100%;padding:0;border:0;background:transparent;overflow:auto}`), this.trigger, this.popup)
    }
    protected triggerElement(): HTMLElement | undefined { return this.trigger }
    protected popupElement(): HTMLElement | undefined { return this.popup }
    protected syncView(): void {
        if (!this.trigger || !this.menu) return
        Object.assign(this.trigger, { label: scalarText(this.label), accessibleLabel: this.accessibleName(), disabled: this.unavailable, icon: this.icon, popupType: 'menu', popupExpanded: bool(this.open) })
        Object.assign(this.menu, { items: this.items, disabled: this.unavailable, accessibleLabel: this.accessibleName() })
    }
}

register('cb-dropdown', Dropdown)
export { DropdownBase }
export type { DropdownProps } from './DropdownBase.js'
