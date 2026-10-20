import { bool, finite, record, text } from '../core/value.js'
export type AxisType = 'linear' | 'category' | 'datetime' | 'logarithmic'
export interface Axis { id?: string; title?: string; type?: AxisType; min?: number; max?: number; categories?: string[]; valueFormatter?: (value: number | string) => string }
export interface Datum { x?: number | string | Date; y?: number | null; size?: number; low?: number; high?: number }
export interface Series { id?: string; name?: string; type?: 'line' | 'spline' | 'area' | 'areaspline' | 'bar' | 'column' | 'scatter' | 'bubble' | 'errorbar' | 'x-threshold' | 'y-threshold'; data?: Array<number | null | Datum>; color?: string; linkedTo?: string; yAxis?: string; value?: number }
export interface Segment { id?: string; name?: string; value?: number | null; y?: number | null; color?: string }
export interface PieSeries { id?: string; name?: string; type?: 'pie' | 'donut'; data?: Segment[] }
export interface ChartSkin { palette: string[]; text: string; muted: string; border: string; surface: string; font: string; fontSize: number; reducedMotion: boolean; motionDuration?: number }
export interface ChartPoint { key: string; itemId: string; seriesId: string; seriesName: string; index: number; x: string | number; y: number | null; low?: number; high?: number; size?: number; percentage?: number }
export interface LegendItem { id: string; name: string; color: string; visible: boolean }
export interface ChartModel { option: Record<string, unknown>; points: ChartPoint[]; legend: LegendItem[]; issues: string[]; empty: boolean; noMatch: boolean; pie: boolean }
export interface CartesianOptions { series?: Series[]; xAxis?: Axis; yAxis?: Axis | Axis[]; inverted?: boolean; stacking?: 'normal' | false; zoomable?: boolean; patterns?:boolean }
export interface PieOptions { series?: PieSeries | null; variant?: 'pie' | 'donut'; innerTitle?: string; innerDescription?: string; patterns?:boolean }
const number = (v: unknown): number | null => typeof v === 'number' && Number.isFinite(v) ? v : null
const base = (skin: ChartSkin) => ({ animation: !skin.reducedMotion, animationDuration: skin.motionDuration ?? 160, animationDurationUpdate: skin.motionDuration ?? 160, animationEasing: 'cubicOut', color: skin.palette, backgroundColor: 'transparent', textStyle: { color: skin.text, fontFamily: skin.font, fontSize: skin.fontSize }, tooltip: { show: false }, aria: { enabled: false } })
function identity(value: Record<string, unknown>, i: number, seen: Set<string>, issues: string[]): string | null {
    const id = text(value.id) || text(value.name) || String(i + 1)
    if (seen.has(id)) { issues.push(`duplicate-id:${id}`); return null }
    seen.add(id); return id
}
function axis(input: unknown, fallback: AxisType, skin: ChartSkin): Record<string, unknown> {
    const a = record(input), types = { linear: 'value', category: 'category', datetime: 'time', logarithmic: 'log' }
    const type = a.type && Object.hasOwn(types, String(a.type)) ? a.type as AxisType : fallback
    const min = number(a.min), max = number(a.max), bounds = min !== null && max !== null && min >= max ? {} : { ...(min !== null ? { min } : {}), ...(max !== null ? { max } : {}) }
    return { type: types[type], name: text(a.title), ...bounds,
        ...(type === 'category' ? { data: Array.isArray(a.categories) ? a.categories.map(v => text(v, String(v))) : undefined } : {}),
        axisLine: { lineStyle: { color: skin.border } }, splitLine: { lineStyle: { color: skin.border, opacity: .35 } },
        axisLabel: { color: skin.muted, formatter: typeof a.valueFormatter === 'function' ? a.valueFormatter : undefined }, nameTextStyle: { color: skin.muted },
    }
}
export function cartesianModel(input: CartesianOptions, skin: ChartSkin, visible?: ReadonlySet<string>): ChartModel {
    const issues: string[] = [], points: ChartPoint[] = [], legend: LegendItem[] = [], engine: Record<string, unknown>[] = [], seen = new Set<string>()
    const raw = Array.isArray(input.series) ? input.series : [], x = record(input.xAxis)
    const axes = (Array.isArray(input.yAxis) ? input.yAxis : [input.yAxis ?? {}]).slice(0, 2)
    if (!axes.length) axes.push({})
    const inverted = bool(input.inverted), thresholdTypes = ['x-threshold', 'y-threshold'], roots = new Map<string, string>()
    const definitions = raw.map((value, i) => ({ value: record(value), id: identity(record(value), i, seen, issues) }))
    const parents = new Map<string, string>()
    for (let i = 0; i < definitions.length; i++) {
        const { value, id } = definitions[i]
        if (!id) continue
        const parent = value.linkedTo === ':previous' ? definitions[i - 1]?.id : text(value.linkedTo)
        if (parent) parents.set(id, parent)
    }
    const findRoot = (id: string, trail = new Set<string>()): string => {
        if (roots.has(id)) return roots.get(id)!
        const parent = parents.get(id)
        if (!parent) return id
        if (trail.has(id) || !definitions.some(d => d.id === parent)) {
            issues.push(`invalid-link:${id}`); parents.delete(id); return id
        }
        trail.add(id)
        const result = findRoot(parent, trail)
        roots.set(id, result)
        return result
    }
    definitions.forEach(d => { if (d.id) findRoot(d.id) })
    let total = 0, filtered = 0
    for (let i = 0; i < raw.length; i++) {
        const { value: s, id } = definitions[i]; if (!id) continue
        const type = text(s.type, 'line'), name = text(s.name) || id, color = text(s.color) || skin.palette[i % skin.palette.length]
        const sourceId = roots.get(id) ?? id
        const root = sourceId !== id ? sourceId : undefined
        const shown = !visible || visible.has(sourceId)
        const yi = Math.max(0, axes.findIndex(a => record(a).id === s.yAxis))
        if (thresholdTypes.includes(type)) {
            const val = number(s.value)
            if (val === null) { issues.push(`invalid-threshold:${id}`); continue }
            if (!root || shown) engine.push({ id, name, type: 'line', data: [], ...(inverted ? { xAxisIndex: yi } : { yAxisIndex: yi }),
                markLine: { silent: true, symbol: 'none', label: { show: !!name, formatter: () => name }, lineStyle: { color, type: 'dashed' }, data: [{ [type === 'x-threshold' ? (inverted ? 'yAxis' : 'xAxis') : (inverted ? 'xAxis' : 'yAxis')]: val }] } })
            continue
        }
        if (!['line', 'spline', 'area', 'areaspline', 'bar', 'column', 'scatter', 'bubble', 'errorbar'].includes(type)) { issues.push(`unsupported-series:${id}`); continue }
        if (!root) legend.push({ id, name, color, visible: shown })
        const data: Array<unknown> = []
        const values = Array.isArray(s.data) ? s.data : []
        for (let j = 0; j < values.length; j++) {
            const datum = values[j], d = record(datum)
            let xv: string | number = typeof d.x === 'string' || typeof d.x === 'number' ? d.x : d.x instanceof Date ? d.x.getTime() : Array.isArray(x.categories) ? String(x.categories[j] ?? j) : j
            if (x.type === 'datetime' && typeof xv === 'string') xv = Date.parse(xv)
            let yv = datum === null ? null : typeof datum === 'number' ? number(datum) : number(d.y)
            if (datum !== null && yv === null && type !== 'errorbar' && d.y !== null) issues.push(`invalid-value:${id}:${j}`)
            if ((typeof xv === 'number' && !Number.isFinite(xv)) || (x.type === 'logarithmic' && (typeof xv !== 'number' || xv <= 0))) { issues.push(`invalid-x:${id}:${j}`); data.push(null); continue }
            if (record(axes[yi]).type === 'logarithmic' && yv !== null && yv <= 0) { issues.push(`invalid-log-value:${id}:${j}`); yv = null }
            const low = number(d.low), high = number(d.high), size = number(d.size)
            if (type === 'errorbar') {
                if (low === null || high === null || low > high || (record(axes[yi]).type === 'logarithmic' && low <= 0)) { issues.push(`invalid-range:${id}:${j}`); data.push(null); continue }
                yv = low / 2 + high / 2
            }
            if (type === 'bubble' && (size === null || size < 0)) { issues.push(`invalid-size:${id}:${j}`); yv = null }
            if (yv !== null) { total++; if (shown) filtered++ }
            const point: ChartPoint = { key: `${id}:${j}`, itemId: sourceId, seriesId: id, seriesName: name, index: j, x: xv, y: yv,
                ...(low !== null ? { low } : {}), ...(high !== null ? { high } : {}), ...(size !== null ? { size } : {}) }
            if (shown) points.push(point)
            data.push(type === 'errorbar' ? [xv, low, high] : inverted ? [yv, xv, size] : [xv, yv, size])
        }
        if (!shown) continue
        const options: Record<string, unknown> = { id, name, data, ...(inverted ? { xAxisIndex: yi } : { yAxisIndex: yi }),
            type: ['bar', 'column'].includes(type) ? 'bar' : ['bubble', 'scatter'].includes(type) ? 'scatter' : type === 'errorbar' ? 'custom' : 'line',
            itemStyle: { color, ...(bool(input.patterns)?{decal: { symbol: ['rect', 'circle', 'triangle'][i % 3], dashArrayX: [1, 0], dashArrayY: [2, 6], color: skin.surface }}:{}) },
            lineStyle: { color, type: i % 2 ? 'dashed' : 'solid' }, symbol: ['circle', 'rect', 'triangle', 'diamond'][i % 4],
            connectNulls: false, emphasis: { focus: 'series' }, smooth: type === 'spline' || type === 'areaspline',
            ...(type === 'area' || type === 'areaspline' ? { areaStyle: { opacity: .2 } } : {}),
            ...(input.stacking === 'normal' && ['bar', 'column', 'area', 'areaspline'].includes(type) ? { stack: `stack-${yi}` } : {}),
        }
        if (type === 'bubble') options.symbolSize = (value: number[]) => finite(value[2])<=0?0:Math.max(4, Math.min(64, Math.sqrt(finite(value[2])) * 2))
        if (type === 'errorbar') {
            options.encode = inverted ? { x: [1, 2], y: 0 } : { x: 0, y: [1, 2] }
            options.renderItem = (_params: unknown, api: { value(i: number): number; coord(value: number[]): number[] }) => {
                const v = api.value(0), lo = api.value(1), hi = api.value(2)
                const a = api.coord(inverted ? [lo, v] : [v, lo]), b = api.coord(inverted ? [hi, v] : [v, hi])
                if (![...a, ...b].every(Number.isFinite)) return null
                const segment = (x1: number, y1: number, x2: number, y2: number) => ({ type: 'line', shape: { x1, y1, x2, y2 }, style: { stroke: color, lineWidth: 2 } })
                return { type: 'group', children: [segment(a[0], a[1], b[0], b[1]), inverted ? segment(a[0], a[1] - 4, a[0], a[1] + 4) : segment(a[0] - 4, a[1], a[0] + 4, a[1]), inverted ? segment(b[0], b[1] - 4, b[0], b[1] + 4) : segment(b[0] - 4, b[1], b[0] + 4, b[1])] }
            }
        }
        engine.push(options)
    }
    const categorical = Array.isArray(x.categories) || raw.some(s => Array.isArray(s?.data) && s.data.some(d => typeof record(d).x === 'string'))
    const xAxis = axis(input.xAxis, categorical ? 'category' : 'linear', skin), yAxis = axes.map(a => axis(a, 'linear', skin))
    return { option: { ...base(skin), grid: { left: 56, right: axes.length > 1 ? 56 : 24, top: 36, bottom: bool(input.zoomable) ? 76 : 40, containLabel: true },
        xAxis: inverted ? yAxis : xAxis, yAxis: inverted ? xAxis : yAxis, series: engine,
        dataZoom: bool(input.zoomable) ? [{ type: 'inside', ...(inverted ? { yAxisIndex: 0 } : { xAxisIndex: 0 }), filterMode: 'none' }, { type: 'slider', ...(inverted ? { yAxisIndex: 0, orient: 'vertical' } : { xAxisIndex: 0 }), filterMode: 'none' }] : [],
    }, points, legend, issues, empty: total === 0, noMatch: total > 0 && filtered === 0, pie: false }
}
export function pieModel(input: PieOptions, skin: ChartSkin, visible?: ReadonlySet<string>): ChartModel {
    const s = record(input.series), values = Array.isArray(s.data) ? s.data : [], issues: string[] = [], legend: LegendItem[] = [], points: ChartPoint[] = [], seen = new Set<string>()
    const normalized: Array<{ id: string; name: string; value: number; color: string; shown: boolean }> = []
    for (let i = 0; i < values.length; i++) {
        const d = record(values[i]), id = identity(d, i, seen, issues); if (!id) continue
        const value = number(d.value ?? d.y), name = text(d.name) || id, color = text(d.color) || skin.palette[i % skin.palette.length], shown = !visible || visible.has(id)
        if (value === null || value < 0) { if ((d.value !== undefined || d.y !== undefined) && d.value !== null && d.y !== null) issues.push(`invalid-segment:${id}`); continue }
        legend.push({ id, name, color, visible: shown }); normalized.push({ id, name, value, color, shown })
    }
    const shown = normalized.filter(d => d.shown), maximum = shown.reduce((max, d) => Math.max(max, d.value), 0)
    const scaledTotal = maximum ? shown.reduce((sum, d) => sum + d.value / maximum, 0) : 0
    const id = text(s.id, 'pie'), name = text(s.name)
    const data = shown.map((d, i) => {
        const percentage = scaledTotal ? (d.value / maximum) / scaledTotal * 100 : 0
        points.push({ key: d.id, itemId: d.id, seriesId: id, seriesName: d.name, index: i, x: d.name, y: d.value, percentage })
        return { id: d.id, name: d.name, value: maximum ? d.value / maximum : 0,
            itemStyle: { color: d.color, borderColor: skin.surface, borderWidth: 2, ...(bool(input.patterns)?{decal: { symbol: i % 2 ? 'circle' : 'rect', dashArrayX: [1, 0], dashArrayY: [2, 7], color: skin.surface }}:{}) } }
    })
    const donut = input.variant === 'donut' || (input.variant !== 'pie' && s.type === 'donut')
    return { option: { ...base(skin), series: [{ id, name, type: 'pie', radius: donut ? ['52%', '78%'] : ['0%', '78%'],
        stillShowZeroSum: false, minAngle: 0, data, label: { show: false }, emphasis: { scale: false }, selectedMode: 'single' }],
        title: donut ? { text: text(input.innerTitle), subtext: text(input.innerDescription), left: 'center', top: 'center', textStyle: { color: skin.text, fontSize: 20 }, subtextStyle: { color: skin.muted } } : undefined,
    }, points, legend, issues, empty: !normalized.some(d => d.value > 0), noMatch: normalized.some(d => d.value > 0) && !shown.some(d => d.value > 0), pie: true }
}
