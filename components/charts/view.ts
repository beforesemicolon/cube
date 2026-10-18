import { createButton,createToggleButton,createIconButton,actionLabel } from '../action/create.js'
import type { ToggleButton } from '../action/toggle-button/index.js'
import { commonCSS, el, label, sheet } from '../core/dom.js'
import { bool, clamp, finite, record, text } from '../core/value.js'
import { lightTokens, token as v } from '../theme/tokens.js'
import { chartEngine, type ChartInstance } from './engine.js'
import type { ChartBase } from './ChartBase.js'
import type { ChartModel, ChartPoint, ChartSkin } from './model.js'
let nextId = 0
export class ChartView {
    readonly root = document.createDocumentFragment()
    private group = el('section', 'chart'); private title = el('div', 'title'); private description = el('p', 'description')
    private plot = el('div', 'plot'); private legend = el('div', 'legend'); private state = el('p', 'status')
    private details = el('p', 'details'); private instructions = el('p', 'instructions'); private actions = el('div', 'actions')
    private data = el('details', 'data'); private summary = el('summary', 'data-summary'); private table = el('table', 'table')
    private navigator = createToggleButton('navigator', () => this.pin()); private retry = createButton('retry', () => { this.failure = false; this.owner.emit('cb-retry'); this.refresh() })
    private all = createButton('show-all', () => this.owner.showAll(this.model?.legend.map(i => i.id) ?? []))
    private unpin = createButton('unpin', () => { this.owner.pinned = false; this.showDetails() })
    private zoomIn = createIconButton('zoom-in','plus', () => this.zoom(.75)); private zoomOut = createIconButton('zoom-out','minus', () => this.zoom(1.25)); private reset = createIconButton('reset-zoom','reset', () => this.zoom(0))
    private instance?: ChartInstance
    private alive = false; private revision = 0; private scheduled = false; private failure = false; private loadingEngine = false
    private keyboardActive=false; private hoverActive=false
    private model?: ChartModel; private legends = new Map<string, ToggleButton>(); private tableKey = ''
    private observer?: ResizeObserver; private mutations?: MutationObserver; private scheme?: MediaQueryList; private reduced?: MediaQueryList
    private windowChange = () => this.refresh()
    private zoomRange: [number, number] = [0, 100]
    constructor(private owner: ChartBase) {
        const id = `cb-chart-${++nextId}`
        this.title.id = `${id}-title`; this.description.id = `${id}-description`; this.instructions.id = `${id}-keys`
        this.group.setAttribute('role', 'group'); this.plot.setAttribute('aria-hidden', 'true')
        this.legend.setAttribute('role', 'group'); this.state.setAttribute('role', 'status'); this.details.setAttribute('role', 'status')
        // The reused button owns its description inside its own shadow root.
        this.navigator.addEventListener('focusin',()=>{this.keyboardActive=true;this.showDetails(true)})
        this.navigator.addEventListener('focusout',()=>{this.keyboardActive=false;if(!this.owner.pinned&&!this.hoverActive)this.instance?.dispatchAction({type:'downplay'});this.updateStatus()})
        this.navigator.addEventListener('keydown', event => {
            if (!this.model) return
            if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) {
                event.preventDefault(); event.stopPropagation(); this.owner.navigate(this.model, event.key); this.showDetails(true)
            } else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.owner.pinned = false; this.showDetails() }
        })
        this.data.addEventListener('toggle', () => { if (this.data.open) this.renderTable() })
        this.data.append(this.summary, this.table)
        this.actions.append(this.navigator, this.unpin, this.all, this.retry, this.zoomIn, this.zoomOut, this.reset)
        this.group.append(this.title, this.description, this.legend, this.plot, this.state, this.actions, this.instructions, this.details, this.data)
        this.root.append(sheet(commonCSS + `
[part=chart]{padding:${v('--spacing-lg')};border:1px solid ${v('--color-separator')};border-radius:${v('--radius-md')};background:${v('--color-surface')}}
[part=title]{font-weight:600;font-size:var(--component-title-font-size,14px)}[part=description],[part=instructions]{color:${v('--color-muted-foreground')}}
[part=legend]{display:flex;flex-wrap:wrap;gap:${v('--spacing-sm')};margin-block:${v('--spacing-sm')}}
[part=legend-item]{display:inline-flex;max-inline-size:100%}
[part=legend-swatch]{display:inline-block;inline-size:var(--component-chart-swatch-size,10px);block-size:var(--component-chart-swatch-size,10px);border:1px solid currentColor;border-radius:var(--component-chart-swatch-radius,2px)}
cb-toggle-button[part=navigator]::part(description){position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
[part=plot]{width:100%;height:${v('--component-chart-height')};min-width:0}
[part=instructions]{font-size:.85em}[part=details]{min-height:1.5em}
[part=data]{overflow:auto}[part=data-summary]{cursor:pointer;min-height:${v('--component-control-height')};padding:${v('--spacing-sm')}}
table{width:100%;border-collapse:collapse}th,td{text-align:start;border-bottom:1px solid ${v('--color-separator')};padding:${v('--spacing-sm')}}
@container(max-width:480px){[part=chart]{padding:${v('--spacing-sm')}}[part=actions]{gap:${v('--spacing-xs')}}}
`), this.group)
    }
    mount(): void {
        this.alive = true; this.failure = false
        if (typeof ResizeObserver !== 'undefined') { this.observer = new ResizeObserver(() => { this.instance?.resize(); this.refresh() }); this.observer.observe(this.owner) }
        this.scheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)'); this.reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')
        this.scheme?.addEventListener('change', this.windowChange); this.reduced?.addEventListener('change', this.windowChange)
        document.addEventListener('cb-theme-change', this.windowChange, true)
        window.addEventListener('resize', this.windowChange)
        this.mutations = new MutationObserver(this.windowChange)
        let ancestor: Node | null = this.owner
        while (ancestor) {
            if (ancestor instanceof Element) this.mutations.observe(ancestor, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] })
            ancestor = ancestor.parentNode ?? (ancestor instanceof ShadowRoot ? ancestor.host : null)
        }
        this.refresh()
    }
    destroy(): void {
        this.alive = false; this.revision++; this.instance?.dispose(); this.instance = undefined
        this.observer?.disconnect(); this.mutations?.disconnect(); this.scheme?.removeEventListener('change', this.windowChange); this.reduced?.removeEventListener('change', this.windowChange)
        document.removeEventListener('cb-theme-change', this.windowChange, true); window.removeEventListener('resize', this.windowChange)
    }
    refresh(): void {
        if (!this.alive || this.scheduled) return
        this.scheduled = true
        queueMicrotask(() => {
            this.scheduled = false
            if (this.alive) void this.draw().catch(error => { if (this.alive) { this.failure = true; this.loadingEngine = false; this.owner.onError(error); this.updateStatus() } })
        })
    }
    private skin(): ChartSkin {
        const style = getComputedStyle(this.owner), read = (key: string) => style.getPropertyValue(key).trim() || lightTokens[key]
        // Resolve var() aliases through a real CSS property, as SVG/canvas engines do not resolve token strings.
        const probe = el('span', 'color-probe'); probe.hidden = true; this.group.append(probe)
        const color = (key: string) => { probe.style.color = ''; probe.style.color = `var(${key}, ${lightTokens[key]})`; return getComputedStyle(probe).color }
        const skin = { palette: [1,2,3,4,5,6].map(n => color(`--custom-chart-series-${n}`)), text: color('--color-foreground'), muted: color('--color-muted-foreground'), border: color('--color-separator'), surface: color('--color-surface'), font: read('--typography-body-font-family'), fontSize: parseFloat(read('--component-chart-font-size')) || 12, motionDuration: cssMilliseconds(read('--motion-duration-normal')), reducedMotion: this.reduced?.matches ?? false }
        probe.remove(); return skin
    }
    private async draw(): Promise<void> {
        const rev = ++this.revision, copy = this.owner.chartLabels
        this.model = this.owner.getModel(this.skin())
        const heading = text(this.owner.heading), description = text(this.owner.description)
        this.title.textContent = heading; this.title.hidden = !heading; this.description.textContent = description; this.description.hidden = !description
        label(this.group, heading || copy.chart); this.group.setAttribute('aria-describedby', this.description.id)
        label(this.legend, copy.legend); this.summary.textContent = copy.table; this.instructions.textContent = copy.instructions
        for (const [node, value] of [[this.navigator, copy.navigate],[this.retry,copy.retry],[this.all,copy.showAll],[this.unpin,copy.unpin],[this.zoomIn,copy.zoomIn],[this.zoomOut,copy.zoomOut],[this.reset,copy.resetZoom]] as const) { Object.assign(node,{locale:this.owner.locale,labels:this.owner.labels});actionLabel(node,value) }
        this.navigator.description=copy.instructions
        if (typeof this.owner.height === 'number' && Number.isFinite(this.owner.height)) this.plot.style.height = `${clamp(this.owner.height, 160, 1200)}px`
        else this.plot.style.removeProperty('height')
        this.renderLegend(); this.showDetails(); if (this.data.open) this.renderTable()
        this.updateStatus()
        if (this.owner.status === 'loading' || this.owner.status === 'error' || this.failure || this.model.empty || this.model.noMatch) {
            if (this.instance) this.instance.setOption({ series: [] }, { notMerge: true })
            return
        }
        this.loadingEngine = !this.instance; this.updateStatus()
        let engine
        try { engine = this.instance ? undefined : await chartEngine() }
        catch (error) {
            if (!this.alive || rev !== this.revision) return
            throw error
        }
        if (!this.alive || rev !== this.revision) return
        this.loadingEngine = false; this.updateStatus()
        if (!this.instance && engine) {
            this.instance = engine.init(this.plot, undefined, { renderer: 'svg' })
            this.instance.on('click', event => this.pick(event, true))
            this.instance.on('mouseover', event => { if (!this.owner.pinned) this.pick(event, false) })
            this.instance.on('globalout',()=>{this.hoverActive=false;if(!this.owner.pinned&&!this.keyboardActive)this.instance?.dispatchAction({type:'downplay'});this.updateStatus()})
            this.instance.on('datazoom', event => {
                const input = record(event), batch = Array.isArray(input.batch) ? record(input.batch[0]) : input
                if (typeof batch.start !== 'number' || typeof batch.end !== 'number' || !Number.isFinite(batch.start) || !Number.isFinite(batch.end)) return
                const start = clamp(batch.start, 0, 100), end = clamp(batch.end, start, 100)
                if (start === this.zoomRange[0] && end === this.zoomRange[1]) return
                this.zoomRange = [start, end]
                this.owner.emit('cb-zoom-change', { start, end })
            })
        }
        this.instance?.setOption(this.model.option, { notMerge: true })
        this.plot.querySelector('svg')?.setAttribute('part', 'graphic')
        if (bool(this.owner.zoomable) && !this.model.pie) this.applyZoom()
        this.showDetails(this.owner.pinned||this.keyboardActive||this.hoverActive)
    }
    private updateStatus(): void {
        const m = this.owner.chartLabels, model = this.model
        const status = this.owner.status === 'error' || this.failure ? m.error : this.owner.status === 'loading' || this.loadingEngine ? m.loading : model?.empty ? m.empty : model?.noMatch ? m.noMatch : ''
        this.state.textContent = status; this.state.hidden = !status
        this.plot.hidden = !!status
        this.group.setAttribute('aria-busy', String(this.owner.status === 'loading' || this.loadingEngine))
        this.retry.hidden = !this.failure && this.owner.status !== 'error'
        const unavailable = !!status || !model?.points.some(p => p.y !== null)
        if(bool(this.navigator.disabled)!==unavailable)this.navigator.disabled=unavailable
        this.instructions.hidden = this.navigator.disabled || !this.keyboardActive
        this.all.hidden = !model?.legend.some(i => !i.visible)
        const zoom = !model?.pie && bool(this.owner.zoomable) && !status
        this.zoomIn.hidden = this.zoomOut.hidden = this.reset.hidden = !zoom
        this.details.hidden = !!status || !(this.owner.pinned||this.keyboardActive||this.hoverActive); this.data.hidden = !model?.points.length
    }
    private renderLegend(): void {
        if (!this.model) return
        const ids = this.model.legend.map(i => i.id)
        for (const [id, node] of this.legends) if (!ids.includes(id)) { node.remove(); this.legends.delete(id) }
        for (const [index, item] of this.model.legend.entries()) {
            let node = this.legends.get(item.id)
            if (!node) {
                node = createToggleButton('legend-item', () => {
                    const current = this.model?.legend.find(i => i.id === item.id)
                    if (current) this.owner.setItemVisible(current.id, !current.visible, this.model!.legend.map(i => i.id))
                })
                const swatch=el('span','legend-swatch');swatch.slot='prefix';swatch.setAttribute('aria-hidden','true');node.append(swatch);this.legends.set(item.id,node)
            }
            node.pressed=item.visible;Object.assign(node,{locale:this.owner.locale,labels:this.owner.labels});actionLabel(node,item.name)
            ;(node.children[0] as HTMLElement).style.backgroundColor = item.color
            // Label rendering belongs to cb-toggle-button.
            if (this.legend.children[index] !== node) this.legend.insertBefore(node, this.legend.children[index] ?? null)
        }
    }
    private pick(event: unknown, pinned: boolean): void {
        if (!this.model) return
        const point = this.owner.enginePoint(this.model, event)
        if (point) { this.hoverActive=true;this.owner.select(point, pinned); this.showDetails(true) }
    }
    private pin(): void {
        if (!this.model) return
        const p = this.owner.selected(this.model)
        if (p) { this.owner.select(p, !this.owner.pinned); this.showDetails(true) }
    }
    private showDetails(highlight = false): void {
        if (!this.model) return
        const selected = this.owner.selected(this.model), m = this.owner.chartLabels
        this.details.textContent = selected ? `${this.owner.pinned ? m.pinned + ': ' : ''}${this.owner.pointText(selected)}` : ''
        this.navigator.accessibleLabel=selected ? `${m.navigate}: ${this.owner.pointText(selected)}` : m.navigate
        this.navigator.pressed=this.owner.pinned; this.unpin.hidden = !this.owner.pinned
        if (selected && highlight && this.instance) {
            this.instance.dispatchAction({ type: 'downplay' }); this.instance.dispatchAction({ type: 'highlight', seriesId: selected.seriesId, dataIndex: selected.index })
        }
        if(this.instance&&!this.owner.pinned&&!this.keyboardActive&&!this.hoverActive)this.instance.dispatchAction({type:'downplay'})
        this.updateStatus()
    }
    private renderTable(): void {
        if (!this.model) return
        const m = this.owner.chartLabels, rows = this.model.points
        const key = JSON.stringify([m, rows, this.owner.chartLanguage, rows.map(p => this.owner.format(p.y))])
        if (key === this.tableKey) return
        this.tableKey = key; this.table.replaceChildren()
        const caption = el('caption', 'table-caption', text(this.owner.heading) || m.chart), head = el('thead', 'table-head'), hrow = el('tr', 'table-row')
        for (const title of [m.series, m.category, m.value, m.range, m.size, m.percentage]) { const th = el('th', 'table-header', title); th.scope = 'col'; hrow.append(th) }
        head.append(hrow); const body = el('tbody', 'table-body')
        for (const p of rows) {
            const row = el('tr', 'table-row')
            const cells = [p.seriesName, String(p.x), this.owner.format(p.y), p.low !== undefined && p.high !== undefined ? `${this.owner.format(p.low)}–${this.owner.format(p.high)}` : m.missing, this.owner.format(p.size), p.percentage !== undefined ? `${this.owner.format(p.percentage)}%` : m.missing]
            cells.forEach(value => row.append(el('td', 'table-cell', value))); body.append(row)
        }
        this.table.append(caption, head, body)
    }
    private zoom(factor: number): void {
        const center = (this.zoomRange[0] + this.zoomRange[1]) / 2, span = factor ? clamp((this.zoomRange[1] - this.zoomRange[0]) * factor, 5, 100) : 100
        const start = clamp(center - span / 2, 0, 100 - span)
        this.zoomRange = [start, start + span]; this.applyZoom()
        this.owner.emit('cb-zoom-change', { start: start, end: start + span })
    }
    private applyZoom(): void { this.instance?.dispatchAction({ type: 'dataZoom', start: this.zoomRange[0], end: this.zoomRange[1] }) }
}

function cssMilliseconds(value:string):number{const duration=parseFloat(value);if(!Number.isFinite(duration)||duration<0)return 160;return Math.min(2000,value.trim().endsWith('ms')?duration:duration*1000)}
