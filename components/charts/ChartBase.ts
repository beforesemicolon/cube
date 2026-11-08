import { Component, type CommonProps } from '../core/Component.js'
import { state } from '../core/runtime.js'
import { record, text } from '../core/value.js'
import type { ChartModel, ChartPoint, ChartSkin } from './model.js'

export interface ChartMessages {
    accessibleLabel: string
    loadingText: string
    emptyText: string
    noMatchText: string
    errorText: string
    retryLabel: string
    showAllLabel: string
    legendLabel: string
    tableLabel: string
    seriesLabel: string
    categoryLabel: string
    valueLabel: string
    rangeLabel: string
    sizeLabel: string
    percentageLabel: string
    missingText: string
    navigateLabel: string
    instructionsText: string
    pinnedText: string
    unpinLabel: string
    zoomInLabel: string
    zoomOutLabel: string
    resetZoomLabel: string
}

export interface ChartProps extends CommonProps {
    heading?: string; description?: string; status?: 'finished' | 'loading' | 'error'
    height?: number; visibleSeries?: string[] | null; visibleSegments?: string[] | null; zoomable?: boolean
    valueFormatter?: ((value: number) => string) | null; patterns?:boolean
    accessibleLabel?: string; loadingText?: string; emptyText?: string; noMatchText?: string; errorText?: string
    retryLabel?: string; showAllLabel?: string; legendLabel?: string; tableLabel?: string
    seriesLabel?: string; categoryLabel?: string; valueLabel?: string; rangeLabel?: string; sizeLabel?: string
    percentageLabel?: string; missingText?: string; navigateLabel?: string; instructionsText?: string
    pinnedText?: string; unpinLabel?: string; zoomInLabel?: string; zoomOutLabel?: string; resetZoomLabel?: string
    messages?: Partial<ChartMessages> | null
}
export abstract class ChartBase<P extends ChartProps = ChartProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'heading', 'description', 'status', 'height', 'visible-series', 'visible-segments', 'zoomable', 'value-formatter','patterns',
        'accessible-label', 'loading-text', 'empty-text', 'no-match-text', 'error-text', 'retry-label', 'show-all-label',
        'legend-label', 'table-label', 'series-label', 'category-label', 'value-label', 'range-label', 'size-label',
        'percentage-label', 'missing-text', 'navigate-label', 'instructions-text', 'pinned-text', 'unpin-label',
        'zoom-in-label', 'zoom-out-label', 'reset-zoom-label', 'messages']
    heading = ''; description = ''; status: 'finished' | 'loading' | 'error' = 'finished'; height: number | undefined = undefined
    visibleSeries: string[] | null = null; visibleSegments: string[] | null = null; zoomable = false
    valueFormatter: ((value: number) => string) | null = null
    patterns=false
    accessibleLabel = ''; loadingText = ''; emptyText = ''; noMatchText = ''; errorText = ''
    retryLabel = ''; showAllLabel = ''; legendLabel = ''; tableLabel = ''
    seriesLabel = ''; categoryLabel = ''; valueLabel = ''; rangeLabel = ''; sizeLabel = ''
    percentageLabel = ''; missingText = ''; navigateLabel = ''; instructionsText = ''
    pinnedText = ''; unpinLabel = ''; zoomInLabel = ''; zoomOutLabel = ''; resetZoomLabel = ''
    messages: Partial<ChartMessages> | null = null
    private hiddenItems = new Set<string>()
    private readonly selectionKey = state<string | null>(null)
    private get currentKey(): string | null { return this.selectionKey[0]() }
    private set currentKey(value: string | null) { this.selectionKey[1](value) }
    private readonly pinnedState = state(false)
    get pinned(): boolean { return this.pinnedState[0]() }
    set pinned(value: boolean) { this.pinnedState[1](value) }
    private lastIssues = ''
    abstract get kind(): 'cartesian' | 'pie'
    protected abstract build(skin: ChartSkin, visible?: ReadonlySet<string>): ChartModel
    protected abstract display(): void
    refresh(): void { this.display() }
    protected update(_name: string): void { this.display() }
    getModel(skin: ChartSkin): ChartModel {
        const controlled = this.kind === 'pie' ? this.visibleSegments : this.visibleSeries
        const all = this.build(skin)
        const allowed = Array.isArray(controlled) ? new Set(controlled) : new Set(all.legend.filter(i => !this.hiddenItems.has(i.id)).map(i => i.id))
        const model = this.build(skin, allowed)
        const issueKey = model.issues.join('|')
        if (issueKey && issueKey !== this.lastIssues) this.emit('error', { code: 'CHART_DATA', issues: model.issues })
        this.lastIssues = issueKey
        if (this.currentKey && !model.points.some(p => p.key === this.currentKey && p.y !== null)) { this.currentKey = null; this.pinned = false }
        return model
    }
    setItemVisible(id: string, visible: boolean, items: readonly string[]): void {
        const controlled = this.kind === 'pie' ? this.visibleSegments : this.visibleSeries
        const selected = new Set(Array.isArray(controlled) ? controlled : items.filter(i => !this.hiddenItems.has(i)))
        if (visible) selected.add(id); else selected.delete(id)
        if (!Array.isArray(controlled)) this.hiddenItems = new Set(items.filter(i => !selected.has(i)))
        this.emit('visibilitychange', { visibleItems: [...selected], kind: this.kind, id, visible })
        this.display()
    }
    showAll(items: readonly string[]): void {
        const controlled = this.kind === 'pie' ? this.visibleSegments : this.visibleSeries
        if (!Array.isArray(controlled)) this.hiddenItems.clear()
        this.emit('visibilitychange', { visibleItems: [...items], kind: this.kind })
        this.display()
    }
    selected(model: ChartModel): ChartPoint | undefined {
        return model.points.find(p => p.key === this.currentKey && p.y !== null) ?? model.points.find(p => p.y !== null)
    }
    select(point: ChartPoint, pinned = this.pinned): void {
        this.currentKey = point.key; this.pinned = pinned
        this.emit('select', { point, pinned })
    }
    navigate(model: ChartModel, key: string): ChartPoint | undefined {
        const points = model.points.filter(p => p.y !== null), current = this.selected(model)
        if (!points.length) return
        let index = Math.max(0, points.findIndex(p => p.key === current?.key))
        if (key === 'ArrowLeft') index = Math.max(0, index - 1)
        else if (key === 'ArrowRight') index = Math.min(points.length - 1, index + 1)
        else if (key === 'Home') index = 0
        else if (key === 'End') index = points.length - 1
        else if (key === 'ArrowUp' || key === 'ArrowDown') {
            const series = [...new Set(points.map(p => p.seriesId))], si = series.indexOf(points[index].seriesId)
            const next = series[Math.min(series.length - 1, Math.max(0, si + (key === 'ArrowUp' ? -1 : 1)))]
            const candidates = points.filter(p => p.seriesId === next)
            const target = candidates.reduce((a, p) => Math.abs(p.index - points[index].index) < Math.abs(a.index - points[index].index) ? p : a)
            index = points.indexOf(target)
        }
        this.select(points[index]); return points[index]
    }
    format(value: number | null | undefined): string {
        if (value === null || value === undefined) return this.message('missingText')
        try { return this.valueFormatter ? text(this.valueFormatter(value), String(value)) : new Intl.NumberFormat(this.documentLanguage(), { maximumFractionDigits: 6 }).format(value) }
        catch (error) { this.onError(error); return String(value) }
    }
    pointText(point: ChartPoint): string {
        const extra = point.low !== undefined && point.high !== undefined ? `; ${this.message('rangeLabel')}: ${this.format(point.low)}–${this.format(point.high)}` : point.size !== undefined ? `; ${this.message('sizeLabel')}: ${this.format(point.size)}` : ''
        const percent = point.percentage !== undefined ? `; ${this.message('percentageLabel')}: ${this.format(point.percentage)}%` : ''
        return `${point.seriesName}; ${String(point.x)}; ${this.message('valueLabel')}: ${this.format(point.y)}${extra}${percent}`
    }
    message(key: keyof ChartMessages): string {
        return text(this[key]) || text(this.messages?.[key])
    }
    enginePoint(model: ChartModel, input: unknown): ChartPoint | undefined {
        const event = record(input)
        return model.points.find(p => p.seriesId === event.seriesId && p.index === event.dataIndex && p.y !== null)
    }
}
