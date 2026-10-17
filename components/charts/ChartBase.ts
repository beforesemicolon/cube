import { Component, type CommonProps } from '../core/Component.js'
import { record, text } from '../core/value.js'
import type { ChartModel, ChartPoint, ChartSkin } from './model.js'
export interface ChartProps extends CommonProps {
    heading?: string; description?: string; status?: 'finished' | 'loading' | 'error'
    height?: number; visibleSeries?: string[] | null; visibleSegments?: string[] | null; zoomable?: boolean
    valueFormatter?: ((value: number) => string) | null
}
export abstract class ChartBase<P extends ChartProps = ChartProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'heading', 'description', 'status', 'height', 'visible-series', 'visible-segments', 'zoomable', 'value-formatter']
    heading = ''; description = ''; status: 'finished' | 'loading' | 'error' = 'finished'; height: number | undefined = undefined
    visibleSeries: string[] | null = null; visibleSegments: string[] | null = null; zoomable = false
    valueFormatter: ((value: number) => string) | null = null
    private hiddenItems = new Set<string>()
    private currentKey: string | null = null
    pinned = false
    private lastIssues = ''
    abstract get kind(): 'cartesian' | 'pie'
    protected abstract build(skin: ChartSkin, visible?: ReadonlySet<string>): ChartModel
    protected abstract display(): void
    get chartLabels() { return this.copy }
    refresh(): void { this.display() }
    get chartLanguage() { return this.language() }
    protected update(_name: string): void { this.display() }
    getModel(skin: ChartSkin): ChartModel {
        const controlled = this.kind === 'pie' ? this.visibleSegments : this.visibleSeries
        const all = this.build(skin)
        const allowed = Array.isArray(controlled) ? new Set(controlled) : new Set(all.legend.filter(i => !this.hiddenItems.has(i.id)).map(i => i.id))
        const model = this.build(skin, allowed)
        const issueKey = model.issues.join('|')
        if (issueKey && issueKey !== this.lastIssues) this.emit('cb-error', { code: 'CHART_DATA', issues: model.issues })
        this.lastIssues = issueKey
        if (this.currentKey && !model.points.some(p => p.key === this.currentKey && p.y !== null)) { this.currentKey = null; this.pinned = false }
        return model
    }
    setItemVisible(id: string, visible: boolean, items: readonly string[]): void {
        const controlled = this.kind === 'pie' ? this.visibleSegments : this.visibleSeries
        const selected = new Set(Array.isArray(controlled) ? controlled : items.filter(i => !this.hiddenItems.has(i)))
        if (visible) selected.add(id); else selected.delete(id)
        if (!Array.isArray(controlled)) this.hiddenItems = new Set(items.filter(i => !selected.has(i)))
        this.emit('cb-visibility-change', { visibleItems: [...selected], kind: this.kind, id, visible })
        this.display()
    }
    showAll(items: readonly string[]): void {
        const controlled = this.kind === 'pie' ? this.visibleSegments : this.visibleSeries
        if (!Array.isArray(controlled)) this.hiddenItems.clear()
        this.emit('cb-visibility-change', { visibleItems: [...items], kind: this.kind })
        this.display()
    }
    selected(model: ChartModel): ChartPoint | undefined {
        return model.points.find(p => p.key === this.currentKey && p.y !== null) ?? model.points.find(p => p.y !== null)
    }
    select(point: ChartPoint, pinned = this.pinned): void {
        this.currentKey = point.key; this.pinned = pinned
        this.emit('cb-select', { point, pinned })
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
        if (value === null || value === undefined) return this.copy.missing
        try { return this.valueFormatter ? text(this.valueFormatter(value), String(value)) : new Intl.NumberFormat(this.language(), { maximumFractionDigits: 6 }).format(value) }
        catch (error) { this.onError(error); return String(value) }
    }
    pointText(point: ChartPoint): string {
        const m = this.copy
        const extra = point.low !== undefined && point.high !== undefined ? `; ${m.range}: ${this.format(point.low)}–${this.format(point.high)}` : point.size !== undefined ? `; ${m.size}: ${this.format(point.size)}` : ''
        const percent = point.percentage !== undefined ? `; ${m.percentage}: ${this.format(point.percentage)}%` : ''
        return `${point.seriesName}; ${String(point.x)}; ${m.value}: ${this.format(point.y)}${extra}${percent}`
    }
    enginePoint(model: ChartModel, input: unknown): ChartPoint | undefined {
        const event = record(input)
        return model.points.find(p => p.seriesId === event.seriesId && p.index === event.dataIndex && p.y !== null)
    }
}
