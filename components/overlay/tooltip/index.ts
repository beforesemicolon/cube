import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, and, html, state, when, type Template } from '../../core/runtime.js'
import '../../text/shortcut/index.js'

import { uid } from '../../core/id.js'
import { bool, scalarText } from '../../core/value.js'
import { TooltipBase } from './TooltipBase.js'
import { tooltipScrollBoundary } from './bounds.js'

export class Tooltip extends TooltipBase {
    stylesheet = componentStylesheet

    private readonly tooltipId = uid('cb-tooltip')
    private readonly slottedContent = state(false)
    private readonly anchorStyle = state('left:-10000px;top:-10000px')
    private bubbleObserver?: ResizeObserver
    private positioningFrame?: number
    private describedElements = new Map<Element, string | null>()
    private get triggerSlot(): HTMLSlotElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLSlotElement ? node : undefined }
    private get bubble(): HTMLElement | undefined { const node = this.refs.bubble?.[0]; return node instanceof HTMLElement ? node : undefined }
    render(): Template {
        return html`
            <span ref="triggerSurface" part="trigger" onslotchange="${this.linkTrigger}" onpointerenter="${() => this.schedule(true)}" onpointerleave="${() => this.schedule(false)}"
                onfocus="${[() => this.schedule(true), true]}" onblur="${[() => this.schedule(false), true]}">
                <slot ref="trigger" part="trigger-content"></slot>
            </span>
            <span ref="bubble" id="${this.tooltipId}" part="tooltip" role="tooltip" onslotchange="${this.contentChanged}"
                popover="manual" data-anchored
                style=${this.anchorStyle[0]}
                hidden="${and(isNot(this.props.content), isNot(this.slottedContent[0]))}">
                <slot ref="content" name="content" part="content">${this.props.content}</slot>
                ${when(this.props.shortcut, html`<cb-shortcut keys=${this.props.shortcut}></cb-shortcut>`)}
            </span>`
    }
    private contentChanged = (): void => {
        const slot = this.refs.content?.[0]
        if (slot instanceof HTMLSlotElement) this.slottedContent[1](slot.assignedNodes().length > 0)
        this.syncTooltip()
    }
    protected syncTooltip(): void {
        this.dataset.placement = ['top', 'top-start', 'top-end', 'right', 'bottom', 'bottom-start', 'bottom-end', 'left'].includes(this.placement ?? '') ? this.placement ?? 'top' : 'top'
        this.toggleAttribute('open', bool(this.open) && Boolean(scalarText(this.content) || this.slottedContent[0]()))
        this.linkTrigger()
        this.schedulePosition()
    }
    protected mount(): void {
        super.mount()
        const view = this.ownerDocument.defaultView
        if (view) this.listen(view, 'resize', this.schedulePosition)
        if (view?.visualViewport) {
            this.listen(view.visualViewport, 'resize', this.schedulePosition)
            this.listen(view.visualViewport, 'scroll', this.schedulePosition)
        }
        if (this.bubble) {
            this.bubbleObserver = new ResizeObserver(this.schedulePosition)
            this.bubbleObserver.observe(this.bubble)
        }
    }
    private schedulePosition = (): void => {
        if (this.positioningFrame !== undefined) return
        // Observed-property updates can run before Markup commits attributes.
        // Position after that commit, not from inside a ResizeObserver delivery.
        this.positioningFrame = this.ownerDocument.defaultView?.requestAnimationFrame(() => {
            this.positioningFrame = undefined
            this.positionBubble()
            // A trigger can move through nested shadow-root scrolling,
            // transforms or animation without a document scroll event.
            if (this.isConnected && this.hasAttribute('open')) this.schedulePosition()
        })
    }
    private positionBubble = (): void => {
        const bubble = this.bubble, trigger = this.refs.triggerSurface?.[0]
        if (!bubble || !bubble.isConnected) return
        if (!this.hasAttribute('open')) {
            if (bubble.matches(':popover-open')) bubble.hidePopover()
            return
        }
        const anchor = this.anchorRect || (trigger instanceof HTMLElement ? trigger.getBoundingClientRect() : this.getBoundingClientRect())
        if (![anchor.left, anchor.top, anchor.right, anchor.bottom].every(Number.isFinite)) return
        // Scrollports govern trigger visibility. The top-layer bubble may
        // escape a small toolbar; an explicit boundary still constrains it.
        const visible = !this.anchorRect && trigger instanceof HTMLElement ? tooltipScrollBoundary(trigger) : this.boundaryRect
        if (visible && (anchor.right <= visible.left || anchor.left >= visible.right || anchor.bottom <= visible.top || anchor.top >= visible.bottom)) {
            if (bubble.matches(':popover-open')) bubble.hidePopover()
            return
        }
        const view = this.ownerDocument.defaultView
        if (!view) return
        const visual = view.visualViewport
        const boundary = this.boundaryRect
        if (boundary && ![boundary.left, boundary.top, boundary.right, boundary.bottom].every(Number.isFinite)) {
            if (bubble.matches(':popover-open')) bubble.hidePopover()
            return
        }
        const leftEdge = Math.max(visual?.offsetLeft ?? 0, boundary?.left ?? -Infinity) + 8
        const topEdge = Math.max(visual?.offsetTop ?? 0, boundary?.top ?? -Infinity) + 8
        const rightEdge = Math.min((visual?.offsetLeft ?? 0) + (visual?.width ?? view.innerWidth), boundary?.right ?? Infinity) - 8
        const bottomEdge = Math.min((visual?.offsetTop ?? 0) + (visual?.height ?? view.innerHeight), boundary?.bottom ?? Infinity) - 8
        if (rightEdge <= leftEdge || bottomEdge <= topEdge || boundary &&
            (anchor.right <= boundary.left || anchor.left >= boundary.right || anchor.bottom <= boundary.top || anchor.top >= boundary.bottom)) {
            if (bubble.matches(':popover-open')) bubble.hidePopover()
            return
        }
        if (!bubble.matches(':popover-open')) bubble.showPopover()
        const { width, height } = bubble.getBoundingClientRect()
        const gap = 6
        const placement = this.placement ?? 'top'
        let left = placement.endsWith('-start') ? anchor.left
            : placement.endsWith('-end') ? anchor.right - width
                : (anchor.left + anchor.right - width) / 2
        let top = anchor.top - height - gap
        if (placement.startsWith('bottom')) {
            top = anchor.bottom + gap
            if (top + height > bottomEdge) top = anchor.top - height - gap
        } else if (placement === 'left' || placement === 'right') {
            top = (anchor.top + anchor.bottom - height) / 2
            left = placement === 'left' ? anchor.left - width - gap : anchor.right + gap
            if (left < leftEdge) left = anchor.right + gap
            else if (left + width > rightEdge) left = anchor.left - width - gap
        } else if (top < topEdge) top = anchor.bottom + gap
        left = Math.max(leftEdge, Math.min(left, rightEdge - width))
        top = Math.max(topEdge, Math.min(top, bottomEdge - height))
        this.anchorStyle[1](`left:${left}px;top:${top}px;max-width:min(280px,${Math.max(0, rightEdge - leftEdge)}px);max-height:${Math.max(0, bottomEdge - topEdge)}px`)
    }
    protected unmount(): void {
        super.unmount();
        if (this.positioningFrame !== undefined) this.ownerDocument.defaultView?.cancelAnimationFrame(this.positioningFrame)
        this.positioningFrame = undefined
        this.bubbleObserver?.disconnect()
        if (this.bubble?.matches(':popover-open')) this.bubble.hidePopover()
        this.restoreDescriptions();
    }
    private linkTrigger = (): void => {
        if (!this.triggerSlot || !this.bubble)
            return;
        const assigned = new Set(this.triggerSlot.assignedElements());
        for (const element of this.describedElements.keys()) {
            if (!assigned.has(element))
                this.restoreDescription(element);
        }
        for (const element of assigned) {
            if (!this.describedElements.has(element))
                this.describedElements.set(element, element.getAttribute('aria-describedby'));
            const ids = new Set((element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
            ids.add(this.bubble.id);
            element.setAttribute('aria-describedby', [...ids].join(' '));
        }
    }
    private restoreDescriptions(): void {
        for (const element of [...this.describedElements.keys()])
            this.restoreDescription(element);
    }
    private restoreDescription(element: Element): void {
        const previous = this.describedElements.get(element);
        if (previous === null)
            element.removeAttribute('aria-describedby');
        else if (previous !== undefined)
            element.setAttribute('aria-describedby', previous);
        this.describedElements.delete(element);
    }
}
export { TooltipBase };
export type { TooltipProps, TooltipAnchor, TooltipPlacement } from './TooltipBase.js';

register('cb-tooltip', Tooltip)
