import { Component, type CommonProps } from '../../core/Component.js'
import { bool, finite } from '../../core/value.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength, type PopupPlacement } from '../../core/popup.js'

export interface HoverCardProps extends CommonProps, PopupConstraintProps { open?: boolean; placement?: PopupPlacement; delay?: number }

/** Hover/focus intent and dismissal behavior without prescribing card content. */
export abstract class HoverCardBase<P extends HoverCardProps = HoverCardProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'open', 'placement', 'delay', ...popupConstraintAttributes]
    open = false
    placement: PopupPlacement = 'bottom-start'
    delay = 250
    popupMaxWidth: PopupLength = '360px'
    popupMaxHeight: PopupLength = '480px'
    private timer?: number
    protected isOpen(): boolean { return this.hasAttribute('open') || bool(this.open) }
    protected abstract syncView(): void
    protected mount(): void { this.syncView() }
    protected update(): void { this.syncView() }
    protected unmount(): void { if (this.timer !== undefined) globalThis.clearTimeout(this.timer) }
    protected schedule(open: boolean): void {
        if (this.timer !== undefined) globalThis.clearTimeout(this.timer)
        if (!open) { this.timer = globalThis.setTimeout(() => this.setOpen(false), 80); return }
        this.timer = globalThis.setTimeout(() => this.setOpen(true), Math.max(0, finite(this.delay, 250)))
    }
    protected setOpen(open: boolean): void {
        if (this.isOpen() === open) return
        this.open = open; this.toggleAttribute('open', open); this.syncView(); this.emit('cb-open-change', { open })
    }
}
