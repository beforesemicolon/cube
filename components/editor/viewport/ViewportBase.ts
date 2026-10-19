import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, clamp, finite, scalarText } from '../../core/value.js'

export interface ViewportProps extends ComponentProps {
    zoom?: number
    minZoom?: number
    maxZoom?: number
    zoomStep?: number
    x?: number
    y?: number
    pannable?: boolean
    grid?: boolean
    controls?: boolean
    zoomInLabel?: string
    zoomOutLabel?: string
    resetLabel?: string
    positionLabel?: string
}

export interface ViewportChangeDetail {
    readonly zoom: number
    readonly x: number
    readonly y: number
    readonly originalEvent?: Event
}

/** Headless pan and zoom behavior for an editor workspace. */
export abstract class ViewportBase extends Component<ViewportProps> {
    static observedAttributes = [
        ...Component.observedAttributes, 'zoom', 'min-zoom', 'max-zoom', 'zoom-step', 'x', 'y', 'pannable', 'grid', 'controls',
        'zoom-in-label', 'zoom-out-label', 'reset-label', 'position-label',
    ]

    zoom = 100
    minZoom = 25
    maxZoom = 400
    zoomStep = 10
    x = 0
    y = 0
    pannable = true
    grid = true
    controls = true
    zoomInLabel = ''
    zoomOutLabel = ''
    resetLabel = ''
    positionLabel = ''

    protected normalizedZoom(value = this.zoom): number {
        const minimum = Math.max(1, finite(this.minZoom, 25))
        const maximum = Math.max(minimum, finite(this.maxZoom, 400))
        return Math.round(clamp(finite(value, 100), minimum, maximum) * 100) / 100
    }

    protected viewportState(): ViewportChangeDetail {
        return { zoom: this.normalizedZoom(), x: finite(this.x), y: finite(this.y) }
    }

    protected canPan(): boolean { return !this.unavailable && bool(this.pannable, true) }
    protected controlsVisible(): boolean { return bool(this.controls, true) }
    protected gridVisible(): boolean { return bool(this.grid, true) }
    protected text(name: 'zoomInLabel' | 'zoomOutLabel' | 'resetLabel' | 'positionLabel'): string { return scalarText(this[name]) }

    setViewport(zoom: number, x: number, y: number, originalEvent?: Event, commit = true): boolean {
        if (this.unavailable) return false
        const detail: ViewportChangeDetail = { zoom: this.normalizedZoom(zoom), x: finite(x), y: finite(y), originalEvent }
        const eventName = commit ? 'cb-before-change' : 'cb-before-input'
        if (!this.request(eventName, detail)) return false
        this.zoom = detail.zoom
        this.x = detail.x
        this.y = detail.y
        this.syncView()
        this.emit(commit ? 'cb-change' : 'cb-input', detail)
        return true
    }

    zoomBy(delta: number, originalEvent?: Event, commit = true): boolean {
        return this.setViewport(this.normalizedZoom() + finite(delta), finite(this.x), finite(this.y), originalEvent, commit)
    }

    panBy(deltaX: number, deltaY: number, originalEvent?: Event, commit = true): boolean {
        if (!this.canPan()) return false
        return this.setViewport(this.normalizedZoom(), finite(this.x) + finite(deltaX), finite(this.y) + finite(deltaY), originalEvent, commit)
    }

    reset(originalEvent?: Event): boolean { return this.setViewport(100, 0, 0, originalEvent) }
}
