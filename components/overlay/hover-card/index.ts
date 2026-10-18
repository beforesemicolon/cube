import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { PopupController, type PopupPlacement } from '../../core/popup.js'
import { HoverCardBase } from './HoverCardBase.js'

export class HoverCard extends HoverCardBase {
    private anchor?: HTMLElement
    private card?: HTMLElement
    private popup?: PopupController
    render(): Node {
        this.anchor = el('span', 'anchor')
        this.anchor.append(slot('trigger', '', 'trigger'))
        this.card = el('article', 'card panel')
        this.card.hidden = true
        this.card.append(slot('', '', 'content'))
        for (const node of [this.anchor, this.card]) {
            node.addEventListener('pointerenter', () => this.schedule(true))
            node.addEventListener('pointerleave', () => this.schedule(false))
        }
        this.anchor.addEventListener('focusin', () => this.schedule(true))
        this.anchor.addEventListener('focusout', () => this.schedule(false))
        return fragment(sheet(editorCSS + `
:host{display:inline-flex;position:relative}[part~=anchor]{display:inline-flex}
[part~=card]{z-index:var(--z-index-popover,50);inline-size:var(--component-hover-card-width,300px);max-inline-size:calc(100vw - 16px);padding:var(--spacing-md,12px);border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface-raised,var(--color-surface));color:var(--color-foreground);box-shadow:0 12px 32px color-mix(in srgb,var(--color-foreground) 18%,transparent)}
`), this.anchor, this.card)
    }
    protected mount(): void {
        if (this.card && this.anchor) this.popup = new PopupController(this.card, this.anchor, () => this.setOpen(false), () => this.validPlacement())
        super.mount()
    }
    protected unmount(): void { super.unmount(); this.popup?.dispose(); this.popup = undefined }
    protected syncView(): void {
        if (this.isOpen()) this.popup?.show(); else this.popup?.hide()
    }
    private validPlacement(): PopupPlacement { return ['bottom-start','bottom-end','top-start','top-end'].includes(this.placement) ? this.placement : 'bottom-start' }
}

register('cb-hover-card', HoverCard)
export { HoverCardBase }
export type { HoverCardProps } from './HoverCardBase.js'
