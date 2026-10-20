import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, finite, scalarText } from '../../core/value.js'

export interface RulersProps extends ComponentProps {
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

export interface RulerCursorDetail { readonly x: number; readonly y: number; readonly value: {readonly x:number;readonly y:number}; readonly previousValue: {readonly x:number;readonly y:number}; readonly originalEvent?: Event }

/** Headless measurement and cursor behavior for editor rulers. */
export abstract class RulersBase extends Component<RulersProps> {
    static observedAttributes = [
        ...Component.observedAttributes, 'zoom', 'origin-x', 'origin-y', 'major-step', 'minor-divisions', 'cursor-x', 'cursor-y',
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
    protected cursorVisible = (): boolean => { return bool(this.showCursor, true) }
    protected coordinateText = (): string => {
        return scalarText(this.coordinateLabel)
            .replace('{x}', String(Math.round(finite(this.cursorX) * 100) / 100))
            .replace('{y}', String(Math.round(finite(this.cursorY) * 100) / 100))
            .replace('{unit}', scalarText(this.unit))
    }

    setCursor(x: number, y: number, originalEvent?: Event, commit = false): boolean {
        if (this.unavailable) return false
        const value = { x: finite(x), y: finite(y) }
        const detail: RulerCursorDetail = { ...value, value, previousValue: {x:finite(this.cursorX),y:finite(this.cursorY)}, originalEvent }
        if (!this.request(commit ? 'beforechange' : 'beforeinput', detail)) return false
        this.cursorX = detail.x
        this.cursorY = detail.y
        this.syncView()
        this.emit(commit ? 'change' : 'input', detail)
        return true
    }
}
