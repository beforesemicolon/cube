import type { EditorRect } from './SelectionOverlayBase.js'

export interface ControlsPosition { readonly x: number; readonly y: number; readonly placement: 'above' | 'below' }
export function positionControls(selection: EditorRect, size: { width: number; height: number }, boundary: EditorRect, gap = 8): ControlsPosition {
    const above = selection.y - gap - size.height
    const below = selection.y + selection.height + gap
    const placement = above >= boundary.y ? 'above' : 'below'
    return {
        x: Math.max(boundary.x, Math.min(selection.x + (selection.width - size.width) / 2, boundary.x + boundary.width - size.width)),
        y: Math.max(boundary.y, Math.min(placement === 'above' ? above : below, boundary.y + boundary.height - size.height)),
        placement,
    }
}

/** Composed ancestors only: no access to another component's shadow DOM or internals. */
function viewportAncestors(element: HTMLElement): HTMLElement[] {
    const result: HTMLElement[] = []
    let node: Node | null = element.parentNode
    while (node) {
        if (node instanceof HTMLElement && node.localName === 'cb-viewport') result.push(node)
        node = node instanceof ShadowRoot ? node.host : node.parentNode
    }
    return result
}

/** A non-modal top-layer toolbar stays upright/unscaled, even inside a clipped, transformed world. */
export class SelectionControlsController {
    private frame?: number
    private disposed = false
    constructor(private host: HTMLElement, private bar: HTMLElement, private enabled: () => boolean, private gap: () => number) {}

    refresh = (): void => {
        const view = this.host.ownerDocument.defaultView
        if (!view || this.disposed || this.frame !== undefined) return
        this.frame = view.requestAnimationFrame(this.place)
    }
    private hide = (): void => {
        if (this.bar.matches(':popover-open')) this.bar.hidePopover()
        this.bar.hidden = true
    }
    private place = (): void => {
        this.frame = undefined
        const view = this.host.ownerDocument.defaultView
        if (!view || this.disposed || !this.host.isConnected || !this.enabled()) { this.hide(); return }
        // Position changes (pan, zoom, CSS transforms/animations) do not trigger ResizeObserver.
        // Read only while the controls are active, and update styles only when values change.
        this.refresh()
        const visual = view.visualViewport
        let left = visual?.offsetLeft ?? 0, top = visual?.offsetTop ?? 0
        let right = left + (visual?.width ?? view.innerWidth), bottom = top + (visual?.height ?? view.innerHeight)
        for (const viewport of viewportAncestors(this.host)) {
            const rect = viewport.getBoundingClientRect()
            left = Math.max(left, rect.left); top = Math.max(top, rect.top)
            right = Math.min(right, rect.right); bottom = Math.min(bottom, rect.bottom)
        }
        if (!this.host.getClientRects().length || right - left <= 16 || bottom - top <= 16) { this.hide(); return }
        const boundary: EditorRect = { x: left + 8, y: top + 8, width: right - left - 16, height: bottom - top - 16 }
        this.style('maxWidth', `${boundary.width}px`); this.style('maxHeight', `${boundary.height}px`)
        this.bar.hidden = false
        if (!this.bar.matches(':popover-open')) this.bar.showPopover()
        const selection = this.host.getBoundingClientRect(), size = this.bar.getBoundingClientRect()
        const next = positionControls({ x: selection.left, y: selection.top, width: selection.width, height: selection.height }, size, boundary, this.gap())
        this.style('left', `${next.x}px`); this.style('top', `${next.y}px`)
        if (this.bar.dataset.placement !== next.placement) this.bar.dataset.placement = next.placement
    }
    private style = (key: 'left' | 'top' | 'maxWidth' | 'maxHeight', value: string): void => {
        if (this.bar.style[key] !== value) this.bar.style[key] = value
    }
    dispose = (): void => {
        this.disposed = true
        if (this.frame !== undefined) this.host.ownerDocument.defaultView?.cancelAnimationFrame(this.frame)
        this.frame = undefined
        this.hide()
    }
}
