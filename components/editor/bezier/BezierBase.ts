import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, clamp, finite, scalarText } from '../../core/value.js'

export interface BezierProps extends ComponentProps {
    value?: string
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    duration?: number
    playing?: boolean
    curveLabel?: string
    previewLabel?: string
    playLabel?: string
    pauseLabel?: string
    resetLabel?: string
    x1Label?: string
    y1Label?: string
    x2Label?: string
    y2Label?: string
}

export interface BezierValue { readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number }
export interface BezierChangeDetail extends BezierValue { readonly value: string; readonly previousValue: string; readonly originalEvent?: Event }

const defaultCurve: BezierValue = { x1: .25, y1: .1, x2: .25, y2: 1 }

function parseCurve(value: string): BezierValue | null {
    const match = /^\s*cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)\s*$/i.exec(value)
    if (!match) return null
    const values = match.slice(1).map(Number)
    if (values.some(valuePart => !Number.isFinite(valuePart))) return null
    return { x1: clamp(values[0]!, 0, 1), y1: clamp(values[1]!, -1, 2), x2: clamp(values[2]!, 0, 1), y2: clamp(values[3]!, -1, 2) }
}

function tidy(value: number): string { return String(Math.round(value * 1000) / 1000) }

/** Headless cubic-bezier parsing, editing, and preview state. */
export abstract class BezierBase extends Component<BezierProps> {
    static observedAttributes = [
        ...Component.observedAttributes, 'value', 'x1', 'y1', 'x2', 'y2', 'duration', 'playing', 'curve-label', 'preview-label',
        'play-label', 'pause-label', 'reset-label', 'x1-label', 'y1-label', 'x2-label', 'y2-label',
    ]

    value = ''
    x1 = defaultCurve.x1
    y1 = defaultCurve.y1
    x2 = defaultCurve.x2
    y2 = defaultCurve.y2
    duration = 1000
    playing = false
    curveLabel = ''
    previewLabel = ''
    playLabel = ''
    pauseLabel = ''
    resetLabel = ''
    x1Label = ''
    y1Label = ''
    x2Label = ''
    y2Label = ''

    protected mount(): void { this.adoptValue(); super.mount() }
    protected update(name: string): void { if (name === 'value') this.adoptValue(); super.update(name) }
    protected curve(): BezierValue {
        return {
            x1: clamp(finite(this.x1, defaultCurve.x1), 0, 1), y1: clamp(finite(this.y1, defaultCurve.y1), -1, 2),
            x2: clamp(finite(this.x2, defaultCurve.x2), 0, 1), y2: clamp(finite(this.y2, defaultCurve.y2), -1, 2),
        }
    }
    protected cssValue = (curve = this.curve()): string => `cubic-bezier(${tidy(curve.x1)}, ${tidy(curve.y1)}, ${tidy(curve.x2)}, ${tidy(curve.y2)})`
    protected text(name: 'curveLabel'|'previewLabel'|'playLabel'|'pauseLabel'|'resetLabel'|'x1Label'|'y1Label'|'x2Label'|'y2Label'): string { return scalarText(this[name]) }

    setPoint(point: 1 | 2, x: number, y: number, originalEvent?: Event, commit = true): boolean {
        if (this.unavailable) return false
        const current = this.curve()
        const curve: BezierValue = point === 1
            ? { ...current, x1: clamp(finite(x, current.x1), 0, 1), y1: clamp(finite(y, current.y1), -1, 2) }
            : { ...current, x2: clamp(finite(x, current.x2), 0, 1), y2: clamp(finite(y, current.y2), -1, 2) }
        return this.applyCurve(curve, originalEvent, commit)
    }

    reset(originalEvent?: Event): boolean { return this.applyCurve(defaultCurve, originalEvent, true) }
    setPlaying(playing: boolean, originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const next = bool(playing)
        if (!this.request('beforeplaybackchange', { playing: next, originalEvent })) return false
        this.playing = next
        this.syncView()
        this.emit(next ? 'play' : 'pause', { playing: next, originalEvent })
        return true
    }

    private applyCurve(curve: BezierValue, originalEvent: Event | undefined, commit: boolean): boolean {
        const detail: BezierChangeDetail = { ...curve, value: this.cssValue(curve), previousValue: this.cssValue(), originalEvent }
        if (!this.request(commit ? 'beforechange' : 'beforeinput', detail)) return false
        this.x1 = curve.x1; this.y1 = curve.y1; this.x2 = curve.x2; this.y2 = curve.y2; this.value = detail.value
        this.syncView()
        this.emit(commit ? 'change' : 'input', detail)
        return true
    }

    private adoptValue(): void {
        const parsed = parseCurve(scalarText(this.value))
        if (!parsed) return
        this.x1 = parsed.x1; this.y1 = parsed.y1; this.x2 = parsed.x2; this.y2 = parsed.y2
    }
}
