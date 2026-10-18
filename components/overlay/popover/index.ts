import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { bool } from '../../core/value.js'
import { PopupController, type PopupPlacement } from '../../core/popup.js'
import { PopoverBase } from './PopoverBase.js'

export class Popover extends PopoverBase {
    private anchor?: HTMLElement
    private panel?: HTMLElement
    private triggerSlot?: HTMLSlotElement
    private popup?: PopupController
    render(): Node {
        this.anchor = el('span', 'anchor')
        this.triggerSlot = slot('trigger', '', 'trigger')
        this.anchor.append(this.triggerSlot)
        this.panel = el('section', 'popover panel')
        this.panel.setAttribute('role', 'dialog')
        this.panel.hidden = true
        this.panel.append(slot('', '', 'content'))
        this.anchor.addEventListener('click', event => this.toggle(event))
        this.triggerSlot.addEventListener('slotchange', () => this.syncTrigger())
        return fragment(sheet(editorCSS + `
:host{display:inline-flex;position:relative}[part~=anchor]{display:inline-flex}
[part~=popover]{z-index:var(--z-index-popover,50);inline-size:var(--component-popover-width,max-content);box-sizing:border-box;overflow:auto;padding:var(--spacing-md,12px);border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface-raised,var(--color-surface));color:var(--color-foreground);box-shadow:var(--component-popover-shadow,0 12px 32px color-mix(in srgb,var(--color-foreground) 18%,transparent))}
`), this.anchor, this.panel)
    }
    protected mount(): void {
        if (this.panel && this.anchor) this.popup = new PopupController(this.panel, this.anchor, () => this.close(), {
            placement: () => this.validPlacement(),
            maxWidth: () => this.popupMaxWidth,
            maxHeight: () => this.popupMaxHeight,
        })
        super.mount()
    }
    protected unmount(): void { this.popup?.dispose(); this.popup = undefined }
    protected syncView(): void {
        if (!this.panel || !this.anchor) return
        this.panel.setAttribute('aria-label', this.accessibleName())
        if (this.isOpen()) this.popup?.show(); else this.popup?.hide()
        this.syncTrigger()
    }
    private validPlacement(): PopupPlacement { return ['bottom-start','bottom-end','top-start','top-end'].includes(this.placement) ? this.placement : 'bottom-start' }
    private syncTrigger(): void {
        if (!this.triggerSlot || !this.panel) return
        for (const element of this.triggerSlot.assignedElements()) {
            element.setAttribute('aria-expanded', String(this.isOpen()))
            element.setAttribute('aria-haspopup', 'dialog')
        }
    }
}

register('cb-popover', Popover)
export { PopoverBase }
export type { PopoverProps } from './PopoverBase.js'
