import { createButton,createPressedButton,createIconButton,actionLabel } from '../action/create.js'
import type { Button } from '../action/button/index.js'
import { commonCSS, el, label, sheet } from '../core/dom.js'
import { bool, clamp, finite, record, text } from '../core/value.js'
import { lightTokens, token as v } from '../theme/tokens.js'
import type { ExpandableSection, ExpandableSectionChangeDetail } from '../data-display/expandable-section/index.js'
import type { Table, TableColumn, TableRecord } from '../data-display/table/index.js'
import '../data-display/expandable-section/index.js'
import '../data-display/table/index.js'
import { chartEngine, type ChartInstance } from './engine.js'
import type { ChartBase } from './ChartBase.js'
import type { ChartModel, ChartPoint, ChartSkin } from './model.js'
let nextId = 0
export class ChartView {
    readonly root = document.createDocumentFragment()
    private group = el('section', 'chart'); private title = el('div', 'title'); private description = el('p', 'description')
    private plot = el('div', 'plot'); private legend = el('div', 'legend'); private state = el('p', 'status')
    private details = el('p', 'details'); private instructions = el('p', 'instructions'); private actions = el('div', 'actions')
    private data = document.createElement('cb-expandable-section') as ExpandableSection
    private table = document.createElement('cb-table') as Table
    private navigator = createPressedButton('navigator', () => this.pin()); private retry = createButton('retry', () => { this.failure = false; this.owner.emit('retry'); this.refresh() })
    private all = createButton('show-all', () => this.owner.showAll(this.model?.legend.map(i => i.id) ?? []))
    private unpin = createButton('unpin', () => { this.owner.pinned = false; this.showDetails() })
    private zoomIn = createIconButton('zoom-in','plus', () => this.zoom(.75)); private zoomOut = createIconButton('zoom-out','minus', () => this.zoom(1.25)); private reset = createIconButton('reset-zoom','reset', () => this.zoom(0))
    private instance?: ChartInstance
    private alive = false; private revision = 0; private scheduled = false; private failure = false; private loadingEngine = false
    private keyboardActive=false; private hoverActive=false
    private model?: ChartModel; private legends = new Map<string, Button>(); private tableKey = ''
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
        this.data.setAttribute('part', 'data'); this.data.setAttribute('exportparts', 'trigger:data-trigger,label:data-label,counter:data-counter,panel:data-panel,content:data-content')
        this.table.setAttribute('part', 'data-table'); this.table.setAttribute('exportparts', 'root:data-table-root,table:data-table-grid,head:data-table-head,row:data-table-row,cell:data-table-cell')
        Object.assign(this.data, { variant: 'default', headingLevel: 2, disableContentPadding: true })
        Object.assign(this.table, { density: 'compact', resizable: false, wrap: true })
        this.data.addEventListener('expansionchange', event => { event.stopPropagation(); if ((event as CustomEvent<ExpandableSectionChangeDetail>).detail.expanded) this.renderTable() })
        this.data.append(this.table)
        this.actions.append(this.navigator, this.unpin, this.all, this.retry, this.zoomIn, this.zoomOut, this.reset)
        this.group.append(this.title, this.description, this.legend, this.plot, this.state, this.actions, this.instructions, this.details, this.data)
        this.root.append(sheet(commonCSS + `
[part=chart]{padding:${v('--spacing-lg')};border:1px solid ${v('--color-separator')};border-radius:${v('--radius-md')};background:${v('--color-surface')}}
[part=title]{font-weight:600;font-size:var(--component-title-font-size,14px)}[part=description],[part=instructions]{color:${v('--color-muted-foreground')}}
[part=legend]{display:flex;flex-wrap:wrap;gap:${v('--spacing-sm')};margin-block:${v('--spacing-sm')}}
[part=legend-item]{display:inline-flex;max-inline-size:100%}
[part=legend-swatch]{display:inline-block;inline-size:var(--component-chart-swatch-size,10px);block-size:var(--component-chart-swatch-size,10px);border:1px solid currentColor;border-radius:var(--component-chart-swatch-radius,2px)}
cb-button[part=navigator]::part(description){position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
[part=plot]{width:100%;height:${v('--component-chart-height')};min-width:0}
[part=instructions]{font-size:.85em}[part=details]{min-height:1.5em}
cb-expandable-section[part=data]{margin-block-start:${v('--spacing-sm')}}
cb-table[part=data-table]{--component-table-min-width:100%;--component-table-max-height:none}
@container(max-width:480px){[part=chart]{padding:${v('--spacing-sm')}}[part=actions]{gap:${v('--spacing-xs')}}}
`), this.group)
    }
    mount(): void {
        this.alive = true; this.failure = false
        if (typeof ResizeObserver !== 'undefined') { this.observer = new ResizeObserver(() => { this.instance?.resize(); this.refresh() }); this.observer.observe(this.owner) }
        this.scheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)'); this.reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')
        this.scheme?.addEventListener('change', this.windowChange); this.reduced?.addEventListener('change', this.windowChange)
        document.addEventListener('themechange', this.windowChange, true)
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
        document.removeEventListener('themechange', this.windowChange, true); window.removeEventListener('resize', this.windowChange)
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
        const rev = ++this.revision
        this.model = this.owner.getModel(this.skin())
        const heading = text(this.owner.heading), description = text(this.owner.description)
        this.title.textContent = heading; this.title.hidden = !heading; this.description.textContent = description; this.description.hidden = !description
        label(this.group, heading || this.owner.accessibleLabel); this.group.setAttribute('aria-describedby', this.description.id)
        label(this.legend, this.owner.legendLabel); this.instructions.textContent = this.owner.instructionsText
        this.data.label = this.owner.tableLabel; this.data.accessibleLabel = ''; this.data.counter = this.model.points.length ? String(this.model.points.length) : ''
        this.table.label = this.owner.tableLabel; this.table.emptyLabel = this.owner.emptyText; this.table.loadingLabel = this.owner.loadingText
        for (const [node, value] of [[this.navigator, this.owner.navigateLabel],[this.retry,this.owner.retryLabel],[this.all,this.owner.showAllLabel],[this.unpin,this.owner.unpinLabel],[this.zoomIn,this.owner.zoomInLabel],[this.zoomOut,this.owner.zoomOutLabel],[this.reset,this.owner.resetZoomLabel]] as const) actionLabel(node,value)
        this.navigator.description=this.owner.instructionsText
        if (typeof this.owner.height === 'number' && Number.isFinite(this.owner.height)) this.plot.style.height = `${clamp(this.owner.height, 160, 1200)}px`
        else this.plot.style.removeProperty('height')
        this.renderLegend(); this.showDetails(); if (this.data.expanded) this.renderTable()
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
                this.owner.emit('zoomchange', { start, end })
            })
        }
        this.instance?.setOption(this.model.option, { notMerge: true })
        this.plot.querySelector('svg')?.setAttribute('part', 'graphic')
        if (bool(this.owner.zoomable) && !this.model.pie) this.applyZoom()
        this.showDetails(this.owner.pinned||this.keyboardActive||this.hoverActive)
    }
    private updateStatus(): void {
        const model = this.model
        const status = this.owner.status === 'error' || this.failure ? this.owner.errorText : this.owner.status === 'loading' || this.loadingEngine ? this.owner.loadingText : model?.empty ? this.owner.emptyText : model?.noMatch ? this.owner.noMatchText : ''
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
                node = createPressedButton('legend-item', () => {
                    const current = this.model?.legend.find(i => i.id === item.id)
                    if (current) this.owner.setItemVisible(current.id, !current.visible, this.model!.legend.map(i => i.id))
                })
                const swatch=el('span','legend-swatch');swatch.slot='prefix';swatch.setAttribute('aria-hidden','true');node.append(swatch);this.legends.set(item.id,node)
            }
            node.pressed=item.visible;actionLabel(node,item.name)
            ;(node.children[0] as HTMLElement).style.backgroundColor = item.color
            // Label rendering belongs to the shared button primitive.
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
        const selected = this.owner.selected(this.model)
        this.details.textContent = selected ? `${this.owner.pinned && this.owner.pinnedText ? this.owner.pinnedText + ': ' : ''}${this.owner.pointText(selected)}` : ''
        this.navigator.accessibleLabel=selected ? `${this.owner.navigateLabel}: ${this.owner.pointText(selected)}` : this.owner.navigateLabel
        this.navigator.pressed=this.owner.pinned; this.unpin.hidden = !this.owner.pinned
        if (selected && highlight && this.instance) {
            this.instance.dispatchAction({ type: 'downplay' }); this.instance.dispatchAction({ type: 'highlight', seriesId: selected.seriesId, dataIndex: selected.index })
        }
        if(this.instance&&!this.owner.pinned&&!this.keyboardActive&&!this.hoverActive)this.instance.dispatchAction({type:'downplay'})
        this.updateStatus()
    }
    private renderTable(): void {
        if (!this.model) return
        const points = this.model.points
        const labels = [this.owner.accessibleLabel, this.owner.seriesLabel, this.owner.categoryLabel, this.owner.valueLabel, this.owner.rangeLabel, this.owner.sizeLabel, this.owner.percentageLabel, this.owner.missingText]
        const key = JSON.stringify([labels, points, points.map(point => this.owner.format(point.y))])
        if (key === this.tableKey) return
        this.tableKey = key
        const rows: TableRecord[] = points.map(point => ({
            id: point.key,
            series: point.seriesName,
            category: String(point.x),
            value: this.owner.format(point.y),
            range: point.low !== undefined && point.high !== undefined ? `${this.owner.format(point.low)}–${this.owner.format(point.high)}` : this.owner.missingText,
            size: this.owner.format(point.size),
            percentage: point.percentage !== undefined ? `${this.owner.format(point.percentage)}%` : this.owner.missingText,
        }))
        const columns: TableColumn[] = [
            { id: 'series', header: this.owner.seriesLabel, field: 'series', minWidth: 140 },
            { id: 'category', header: this.owner.categoryLabel, field: 'category', minWidth: 120 },
            { id: 'value', header: this.owner.valueLabel, field: 'value', minWidth: 100, align: 'end' },
        ]
        if (points.some(point => point.low !== undefined || point.high !== undefined)) columns.push({ id: 'range', header: this.owner.rangeLabel, field: 'range', minWidth: 120, align: 'end' })
        if (points.some(point => point.size !== undefined)) columns.push({ id: 'size', header: this.owner.sizeLabel, field: 'size', minWidth: 100, align: 'end' })
        if (points.some(point => point.percentage !== undefined)) columns.push({ id: 'percentage', header: this.owner.percentageLabel, field: 'percentage', minWidth: 110, align: 'end' })
        this.table.items = rows; this.table.columns = columns; this.table.itemKey = 'id'
    }
    private zoom(factor: number): void {
        const center = (this.zoomRange[0] + this.zoomRange[1]) / 2, span = factor ? clamp((this.zoomRange[1] - this.zoomRange[0]) * factor, 5, 100) : 100
        const start = clamp(center - span / 2, 0, 100 - span)
        this.zoomRange = [start, start + span]; this.applyZoom()
        this.owner.emit('zoomchange', { start: start, end: start + span })
    }
    private applyZoom(): void { this.instance?.dispatchAction({ type: 'dataZoom', start: this.zoomRange[0], end: this.zoomRange[1] }) }
}

function cssMilliseconds(value:string):number{const duration=parseFloat(value);if(!Number.isFinite(duration)||duration<0)return 160;return Math.min(2000,value.trim().endsWith('ms')?duration:duration*1000)}
