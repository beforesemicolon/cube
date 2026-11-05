import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, clamp, finite, scalarText } from '../../core/value.js'
import type { ComponentAction } from '../../core/actions.js'

export type ViewportActionPosition = 'top-left' | 'top-right' | 'bottom-right'
export interface ViewportAction extends ComponentAction {
    readonly shortcut?: string
    readonly position: ViewportActionPosition
    readonly pressed?: boolean
}
export interface ViewportActionDetail {
    readonly action: ViewportAction
    readonly pressed?: boolean
    readonly originalEvent?: Event
}

export interface ViewportProps extends ComponentProps {
    zoom?: number
    minZoom?: number
    maxZoom?: number
    zoomStep?: number
    x?: number
    y?: number
    pannable?: boolean
    panTool?: boolean
    grid?: boolean
    controls?: boolean
    zoomInLabel?: string
    zoomOutLabel?: string
    resetLabel?: string
    zoomInShortcut?: string
    zoomOutShortcut?: string
    resetShortcut?: string
    positionLabel?: string
    actions?: readonly ViewportAction[]
}

export interface ViewportValue {
    readonly zoom: number
    readonly x: number
    readonly y: number
}
export interface ViewportChangeDetail extends ViewportValue { readonly value: ViewportValue; readonly previousValue: ViewportValue; readonly originalEvent?: Event }

/** Headless pan and zoom behavior for an editor workspace. */
export abstract class ViewportBase extends Component<ViewportProps> {
    static observedAttributes = [
        ...Component.observedAttributes, 'zoom', 'min-zoom', 'max-zoom', 'zoom-step', 'x', 'y', 'pannable', 'pan-tool', 'grid', 'controls',
        'zoom-in-label', 'zoom-out-label', 'reset-label', 'position-label', 'actions', 'zoom-in-shortcut', 'zoom-out-shortcut', 'reset-shortcut',
    ]

    zoom = 100
    minZoom = 25
    maxZoom = 400
    zoomStep = 10
    x = 0
    y = 0
    pannable = true
    panTool = false
    grid = true
    controls = true
    zoomInLabel = ''
    zoomInShortcut = ''
    zoomOutShortcut = ''
    resetShortcut = ''
    zoomOutLabel = ''
    resetLabel = ''
    positionLabel = ''
    actions: readonly ViewportAction[] = []

    protected actionsAt = (position: ViewportActionPosition): readonly ViewportAction[] => {
        const ids = new Set<string>()
        return (Array.isArray(this.actions) ? this.actions : []).filter((action: ViewportAction) => {
            if (!action || typeof action !== 'object' || action.position !== position) return false
            const id = scalarText(action.id).trim()
            if (!id || !scalarText(action.label).trim() || ids.has(id)) return false
            ids.add(id)
            return true
        })
    }

    activateAction = (id: string, originalEvent?: Event): boolean => {
        const action = (['top-left', 'top-right', 'bottom-right'] as const)
            .flatMap(position => this.actionsAt(position)).find(candidate => candidate.id === id)
        if (!action || bool(action.disabled) || this.unavailable) return false
        const detail: ViewportActionDetail = {
            action, originalEvent,
            ...(action.pressed === undefined ? {} : { pressed: !bool(action.pressed) }),
        }
        if (!this.request('beforeaction', detail)) return false
        this.emit('action', detail)
        return true
    }

    protected normalizedZoom(value = this.zoom): number {
        const minimum = Math.max(1, finite(this.minZoom, 25))
        const maximum = Math.max(minimum, finite(this.maxZoom, 400))
        return Math.round(clamp(finite(value, 100), minimum, maximum) * 100) / 100
    }

    protected viewportState(): ViewportValue {
        return { zoom: this.normalizedZoom(), x: finite(this.x), y: finite(this.y) }
    }

    protected canPan(): boolean { return !this.unavailable && bool(this.pannable, true) }
    protected panToolActive = (): boolean => this.canPan() && bool(this.panTool, false)
    protected controlsVisible = (): boolean => { return bool(this.controls, true) }
    protected gridVisible(): boolean { return bool(this.grid, true) }
    protected text(name: 'zoomInLabel' | 'zoomOutLabel' | 'resetLabel' | 'positionLabel'): string { return scalarText(this[name]) }

    setViewport(zoom: number, x: number, y: number, originalEvent?: Event, commit = true): boolean {
        if (this.unavailable) return false
        const value = { zoom: this.normalizedZoom(zoom), x: finite(x), y: finite(y) }
        const detail: ViewportChangeDetail = { ...value, value, previousValue: this.viewportState(), originalEvent }
        const eventName = commit ? 'beforechange' : 'beforeinput'
        if (!this.request(eventName, detail)) return false
        this.zoom = detail.zoom
        this.x = detail.x
        this.y = detail.y
        this.syncView()
        this.emit(commit ? 'change' : 'input', detail)
        return true
    }

    zoomBy(delta: number, originalEvent?: Event, commit = true): boolean {
        return this.setViewport(this.normalizedZoom() + finite(delta), finite(this.x), finite(this.y), originalEvent, commit)
    }

    protected zoomAround = (delta: number, x: number, y: number, originalEvent?: Event, commit = true): boolean => {
        const current = this.viewportState()
        const zoom = this.normalizedZoom(current.zoom + finite(delta))
        if (zoom === current.zoom) return false
        const ratio = zoom / current.zoom
        return this.setViewport(zoom,
            finite(x) - (finite(x) - current.x) * ratio,
            finite(y) - (finite(y) - current.y) * ratio,
            originalEvent, commit)
    }

    panBy(deltaX: number, deltaY: number, originalEvent?: Event, commit = true): boolean {
        if (!this.canPan()) return false
        return this.setViewport(this.normalizedZoom(), finite(this.x) + finite(deltaX), finite(this.y) + finite(deltaY), originalEvent, commit)
    }

    reset(originalEvent?: Event): boolean { return this.setViewport(100, 0, 0, originalEvent) }
}
