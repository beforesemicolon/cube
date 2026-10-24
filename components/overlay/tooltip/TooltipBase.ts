import { Component, type CommonProps } from '../../core/Component.js'
import { finite } from '../../core/value.js'

export interface TooltipAnchor { left: number; top: number; right: number; bottom: number }
export interface TooltipProps extends CommonProps { content?: string; placement?: 'top' | 'right' | 'bottom' | 'left'; delay?: number; open?: boolean; anchorRect?: TooltipAnchor | null; boundaryRect?: TooltipAnchor | null }

/** Hover/focus timing and visibility behavior without prescribing tooltip markup. */
export abstract class TooltipBase<P extends TooltipProps = TooltipProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'content', 'placement', 'delay', 'open', 'anchor-rect', 'boundary-rect']
    content = ''
    placement: TooltipProps['placement'] = 'top'
    delay = 400
    open = false
    anchorRect: TooltipAnchor | null = null
    boundaryRect: TooltipAnchor | null = null
    private timer?: ReturnType<typeof globalThis.setTimeout>
    protected abstract syncTooltip(): void
    protected mount(): void { this.syncTooltip() }
    protected update(): void { this.syncTooltip() }
    protected unmount(): void { if (this.timer !== undefined) globalThis.clearTimeout(this.timer) }
    protected schedule(open: boolean): void {
        if (this.timer !== undefined) globalThis.clearTimeout(this.timer)
        if (!open) { this.setOpen(false); return }
        this.timer = globalThis.setTimeout(() => this.setOpen(true), Math.max(0, finite(this.delay, 400)))
    }
    protected setOpen(open: boolean): void {
        if (this.open === open) return
        this.open = open; this.toggleAttribute('open', open); this.syncTooltip(); this.emit('openchange', { open })
    }
}
