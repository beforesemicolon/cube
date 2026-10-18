import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot, uid } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { TooltipBase } from './TooltipBase.js'

export class Tooltip extends TooltipBase {
    private trigger?: HTMLElement
    private triggerSlot?: HTMLSlotElement
    private bubble?: HTMLElement
    private describedElements = new Map<Element, string | null>()
    render(): Node {
        this.trigger = el('span', 'trigger')
        this.triggerSlot = slot('', '', 'trigger-content'); this.trigger.append(this.triggerSlot)
        this.bubble = el('span', 'tooltip'); this.bubble.id = uid('cb-tooltip'); this.bubble.setAttribute('role', 'tooltip'); this.bubble.append(slot('content', '', 'content'))
        this.trigger.addEventListener('pointerenter', () => this.schedule(true)); this.trigger.addEventListener('pointerleave', () => this.schedule(false))
        this.trigger.addEventListener('focusin', () => this.schedule(true)); this.trigger.addEventListener('focusout', () => this.schedule(false))
        this.triggerSlot.addEventListener('slotchange', () => this.linkTrigger())
        return fragment(sheet(editorCSS + `:host{position:relative;display:inline-flex}[part=trigger]{display:inline-flex}[part=tooltip]{position:absolute;z-index:var(--z-index-tooltip,100);inline-size:max-content;max-inline-size:min(280px,80vw);padding:4px 8px;border-radius:var(--radius-sm,6px);background:var(--color-foreground,#20262b);color:var(--color-background,#fff);font-size:var(--component-caption-font-size,11px);line-height:1.4;pointer-events:none;opacity:0;visibility:hidden;transition:opacity var(--motion-duration-fast,100ms) ease-out;inset-block-end:calc(100% + 6px);inset-inline-start:50%;translate:-50% 0}:host([open]) [part=tooltip]{opacity:1;visibility:visible}:host([data-placement=bottom]) [part=tooltip]{inset-block-start:calc(100% + 6px);inset-block-end:auto}:host([data-placement=left]) [part=tooltip]{inset-inline-end:calc(100% + 6px);inset-inline-start:auto;inset-block-start:50%;inset-block-end:auto;translate:0 -50%}:host([data-placement=right]) [part=tooltip]{inset-inline-start:calc(100% + 6px);inset-block-start:50%;inset-block-end:auto;translate:0 -50%}`), this.trigger, this.bubble)
    }
    protected syncTooltip(): void {
        if (!this.bubble) return
        this.dataset.placement = ['top', 'right', 'bottom', 'left'].includes(this.placement ?? '') ? this.placement ?? 'top' : 'top'
        this.bubble.hidden = !scalarText(this.content) && !this.querySelector('[slot=content]')
        const contentSlot = this.bubble.querySelector('slot'); if (contentSlot) contentSlot.textContent = scalarText(this.content)
        this.toggleAttribute('open', bool(this.open) && !this.bubble.hidden)
        this.linkTrigger()
    }
    protected unmount(): void {
        super.unmount()
        this.restoreDescriptions()
    }
    private linkTrigger(): void {
        if (!this.triggerSlot || !this.bubble) return
        const assigned = new Set(this.triggerSlot.assignedElements())
        for (const element of this.describedElements.keys()) {
            if (!assigned.has(element)) this.restoreDescription(element)
        }
        for (const element of assigned) {
            if (!this.describedElements.has(element)) this.describedElements.set(element, element.getAttribute('aria-describedby'))
            const ids = new Set((element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)); ids.add(this.bubble.id); element.setAttribute('aria-describedby', [...ids].join(' '))
        }
    }
    private restoreDescriptions(): void {
        for (const element of [...this.describedElements.keys()]) this.restoreDescription(element)
    }
    private restoreDescription(element: Element): void {
        const previous = this.describedElements.get(element)
        if (previous === null) element.removeAttribute('aria-describedby')
        else if (previous !== undefined) element.setAttribute('aria-describedby', previous)
        this.describedElements.delete(element)
    }
}

register('cb-tooltip', Tooltip)
export { TooltipBase }
export type { TooltipProps } from './TooltipBase.js'
