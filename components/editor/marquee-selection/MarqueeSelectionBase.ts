import { Component, type CommonProps } from '../../core/Component.js'
import { bool, finite } from '../../core/value.js'
import type { EditorRect } from '../selection-overlay/SelectionOverlayBase.js'

export interface MarqueeTarget { id: string; rect: EditorRect; disabled?: boolean }
export interface MarqueeSelectionProps extends CommonProps { targets?: readonly MarqueeTarget[]; disabled?: boolean; threshold?: number }
export interface EditorPoint { x: number; y: number }

function bounds(start: EditorPoint, end: EditorPoint): EditorRect {
    return { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: Math.abs(end.x - start.x), height: Math.abs(end.y - start.y) }
}
function intersects(left: EditorRect, right: EditorRect): boolean {
    return left.x <= right.x + right.width && left.x + left.width >= right.x && left.y <= right.y + right.height && left.y + left.height >= right.y
}

/** Pointer marquee state and geometric hit testing independent from editor document models. */
export abstract class MarqueeSelectionBase<P extends MarqueeSelectionProps = MarqueeSelectionProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'targets', 'disabled', 'threshold']
    targets: readonly MarqueeTarget[] = []
    disabled = false
    threshold = 3
    protected startPoint?: EditorPoint
    protected currentPoint?: EditorPoint
    protected additive = false
    protected abstract syncMarquee(rect?: EditorRect): void

    begin(point: EditorPoint, additive = false, originalEvent?: Event): boolean {
        if (bool(this.disabled)) return false
        const detail = { point, additive, originalEvent }
        if (!this.dispatchEvent(new CustomEvent('beforemarqueestart', { detail, bubbles: true, composed: true, cancelable: true }))) return false
        this.startPoint = { x: finite(point.x), y: finite(point.y) }; this.currentPoint = { ...this.startPoint }; this.additive = additive
        this.syncMarquee(bounds(this.startPoint, this.currentPoint)); this.emit('marqueestart', detail); return true
    }
    updateSelection(point: EditorPoint, originalEvent?: Event): void {
        if (!this.startPoint) return
        this.currentPoint = { x: finite(point.x), y: finite(point.y) }
        const rect = bounds(this.startPoint, this.currentPoint)
        this.syncMarquee(rect); this.emit('marqueechange', { rect, originalEvent })
    }
    finish(originalEvent?: Event): readonly string[] {
        if (!this.startPoint || !this.currentPoint) return []
        const rect = bounds(this.startPoint, this.currentPoint)
        const active = rect.width >= Math.max(0, finite(this.threshold, 3)) || rect.height >= Math.max(0, finite(this.threshold, 3))
        const selectedIds = active && Array.isArray(this.targets) ? this.targets.filter(target => !bool(target.disabled) && intersects(rect, target.rect)).map(target => target.id) : []
        const detail = { rect, selectedIds, additive: this.additive, originalEvent }
        this.startPoint = undefined; this.currentPoint = undefined; this.syncMarquee(); this.emit('marqueeend', detail); return selectedIds
    }
    cancel(originalEvent?: Event): void {
        if (!this.startPoint) return
        this.startPoint = undefined; this.currentPoint = undefined; this.syncMarquee(); this.emit('marqueecancel', { originalEvent })
    }
}
