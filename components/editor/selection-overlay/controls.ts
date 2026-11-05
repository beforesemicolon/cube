import type { EditorRect, SelectionActionsAlign } from './SelectionOverlayBase.js'

export interface ControlsPosition {
    readonly x: number
    readonly y: number
    readonly placement: 'above' | 'below'
}
export function positionControls(
    selection: EditorRect,
    size: { width: number; height: number },
    gap = 8,
    boundary?: EditorRect,
    aboveOnly = false,
    align: SelectionActionsAlign = 'center'
): ControlsPosition {
    const above = selection.y - gap - size.height
    const placement = !boundary || aboveOnly || above >= boundary.y ? 'above' : 'below'
    const x = selection.x + (selection.width - size.width) * (align === 'start' ? 0 : align === 'end' ? 1 : .5)
    const y = placement === 'above' ? above : selection.y + selection.height + gap
    return {
        x: boundary ? Math.max(boundary.x, Math.min(x, boundary.x + boundary.width - size.width)) : x,
        y: boundary ? Math.max(boundary.y, Math.min(y, boundary.y + boundary.height - size.height)) : y,
        placement,
    }
}

/** Composed ancestors only: no access to another component's shadow DOM or internals. */
function viewportAncestors(element: HTMLElement): HTMLElement[] {
    const result: HTMLElement[] = []
    let node: Node | null = element.parentNode
    while (node) {
        if (node instanceof HTMLElement && node.localName === 'cb-viewport')
            result.push(node)
        node = node instanceof ShadowRoot ? node.host : node.parentNode
    }
    return result
}

/** A non-modal top-layer toolbar stays upright/unscaled, even inside a clipped, transformed world. */
export class SelectionControlsController {
    private frame?: number
    private disposed = false
    constructor(
        private host: HTMLElement,
        private bar: HTMLElement,
        private enabled: () => boolean,
        private gap: () => number,
        private aboveOnly = false,
        private align: () => SelectionActionsAlign = () => 'center',
    ) {}

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
        if (
            !view ||
            this.disposed ||
            !this.host.isConnected ||
            !this.enabled()
        ) {
            this.hide()
            return
        }
        // Position changes (pan, zoom, CSS transforms/animations) do not trigger ResizeObserver.
        // Read only while the controls are active, and update styles only when values change.
        this.refresh()
        const visual = view.visualViewport
        let left = visual?.offsetLeft ?? 0,
            top = visual?.offsetTop ?? 0
        let right = left + (visual?.width ?? view.innerWidth),
            bottom = top + (visual?.height ?? view.innerHeight)
        const viewports = viewportAncestors(this.host)
        for (const viewport of viewports) {
            const rect = viewport.getBoundingClientRect()
            left = Math.max(left, rect.left)
            top = Math.max(top, rect.top)
            right = Math.min(right, rect.right)
            bottom = Math.min(bottom, rect.bottom)
        }
        if (
            !this.host.getClientRects().length ||
            right - left <= 16 ||
            bottom - top <= 16
        ) {
            this.hide()
            return
        }
        const boundary: EditorRect = {
            x: left + 8,
            y: top + 8,
            width: right - left - 16,
            height: bottom - top - 16,
        }
        this.style('maxWidth', `${boundary.width}px`)
        this.style('maxHeight', `${boundary.height}px`)
        this.bar.hidden = false
        if (!this.bar.matches(':popover-open')) this.bar.showPopover()
        const selection = this.host.getBoundingClientRect(),
            size = this.bar.getBoundingClientRect()
        const next = positionControls(
            {
                x: selection.left,
                y: selection.top,
                width: selection.width,
                height: selection.height,
            },
            size,
            this.gap(),
            // Standalone, view-filling artboards have no canvas to pan. Keep
            // their controls reachable; only canvas chrome travels offscreen.
            viewports.length ? undefined : boundary,
            this.aboveOnly,
            this.align()
        )
        // Keep the toolbar attached to its object, never pinned to a viewport
        // edge. Top-layer elements escape ancestor overflow, so clip only the
        // portions outside the canvas rather than shifting the toolbar inward.
        const clipping = [Math.max(0, top - next.y), Math.max(0, next.x + size.width - right),
            Math.max(0, next.y + size.height - bottom), Math.max(0, left - next.x)]
        this.style('clipPath', clipping.some(value => value > 0) ? `inset(${clipping.map(value => `${value}px`).join(' ')})` : 'none')
        this.bar.inert = next.x + size.width <= left || next.x >= right || next.y + size.height <= top || next.y >= bottom
        this.style('top', `${next.y}px`)
        this.style('left', `${next.x}px`)
        if (this.bar.dataset.placement !== next.placement)
            this.bar.dataset.placement = next.placement
    }
    private style = (
        key: 'left' | 'top' | 'maxWidth' | 'maxHeight' | 'clipPath',
        value: string
    ): void => {
        if (this.bar.style[key] !== value) this.bar.style[key] = value
    }
    dispose = (): void => {
        this.disposed = true
        if (this.frame !== undefined)
            this.host.ownerDocument.defaultView?.cancelAnimationFrame(
                this.frame
            )
        this.frame = undefined
        this.hide()
    }
}
