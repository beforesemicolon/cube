import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool, finite, scalarText } from '../../core/value.js'

export interface RulersProps extends UIProps {
    zoom?: number
    originX?: number
    originY?: number
    majorStep?: number
    minorDivisions?: number
    cursorX?: number
    cursorY?: number
    showCursor?: boolean
    unit?: string
    coordinateLabel?: string
}

export interface RulerCursorDetail { readonly x: number; readonly y: number; readonly originalEvent?: Event }

/** Headless measurement and cursor behavior for editor rulers. */
export abstract class RulersBase extends UIComponent<RulersProps> {
    static observedAttributes = [
        ...UIComponent.observedAttributes, 'zoom', 'origin-x', 'origin-y', 'major-step', 'minor-divisions', 'cursor-x', 'cursor-y',
        'show-cursor', 'unit', 'coordinate-label',
    ]

    zoom = 100
    originX = 0
    originY = 0
    majorStep = 100
    minorDivisions = 10
    cursorX = 0
    cursorY = 0
    showCursor = true
    unit = 'px'
    coordinateLabel = ''

    protected scale(): number { return Math.max(.01, finite(this.zoom, 100) / 100) }
    protected step(): number { return Math.max(1, finite(this.majorStep, 100)) }
    protected divisions(): number { return Math.max(1, Math.round(finite(this.minorDivisions, 10))) }
    protected cursorVisible(): boolean { return bool(this.showCursor, true) }
    protected coordinateText(): string {
        return scalarText(this.coordinateLabel)
            .replace('{x}', String(Math.round(finite(this.cursorX) * 100) / 100))
            .replace('{y}', String(Math.round(finite(this.cursorY) * 100) / 100))
            .replace('{unit}', scalarText(this.unit))
    }

    setCursor(x: number, y: number, originalEvent?: Event, commit = false): boolean {
        if (this.unavailable) return false
        const detail: RulerCursorDetail = { x: finite(x), y: finite(y), originalEvent }
        if (!this.request(commit ? 'cb-before-change' : 'cb-before-input', detail)) return false
        this.cursorX = detail.x
        this.cursorY = detail.y
        this.syncView()
        this.emit(commit ? 'cb-change' : 'cb-input', detail)
        return true
    }
}
