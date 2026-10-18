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
    private primary?: Button
    private trigger?: IconButton
    private popup?: HTMLElement
    private menu?: Menu
    render(): Node {
        const group = el('div', 'group')
        this.primary = document.createElement('cb-button') as Button; this.primary.setAttribute('part', 'primary'); this.primary.addEventListener('cb-action', event => this.activatePrimary(event))
        this.trigger = document.createElement('cb-icon-button') as IconButton; this.trigger.setAttribute('part', 'trigger'); this.trigger.addEventListener('cb-action', () => this.toggle())
        group.append(this.primary, this.trigger)
        this.popup = el('div', 'popup'); this.popup.hidden = true
        this.menu = document.createElement('cb-menu') as Menu; this.menu.setAttribute('part', 'menu'); this.menu.addEventListener('cb-action', event => { this.emit('cb-action', { ...(event as CustomEvent).detail, source: 'menu' }); this.setOpen(false) })
        this.popup.append(this.menu)
        return fragment(sheet(editorCSS + `:host{display:inline-block}[part=group]{display:flex;align-items:stretch}[part=trigger]{margin-inline-start:-1px}[part=popup]{z-index:var(--z-index-dropdown,40);padding:0;border:0;background:transparent;overflow:visible}`), group, this.popup)
    }
    protected triggerElement(): HTMLElement | undefined { return this.trigger }
    protected popupElement(): HTMLElement | undefined { return this.popup }
    protected syncView(): void {
        if (!this.primary || !this.trigger || !this.menu) return
        Object.assign(this.primary, { label: scalarText(this.label) || this.ui('action'), accessibleLabel: this.accessibleName('action'), disabled: this.unavailable, loading: bool(this.loading), variant: 'primary' })
        Object.assign(this.trigger, { icon: 'down', accessibleLabel: scalarText(this.menuLabel) || this.ui('moreActions'), disabled: this.unavailable, variant: 'primary', popupType: 'menu', popupExpanded: bool(this.open) })
        Object.assign(this.menu, { items: this.items, disabled: this.unavailable, accessibleLabel: scalarText(this.menuLabel) || this.ui('moreActions') })
    }
}

register('cb-split-button', SplitButton)
export { SplitButtonBase }
export type { SplitButtonProps } from './SplitButtonBase.js'
