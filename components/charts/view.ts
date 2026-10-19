import { when, is, or, isNot, and, pick, html, repeat, state, type Template } from '../core/runtime.js';
import { commonCSS } from '../theme/styles.js';
import { bool, clamp, record, text } from '../core/value.js';
import { lightTokens, token as v } from '../theme/tokens.js';
import type { TableColumn, TableRecord } from '../data-display/table/index.js';
import { chartEngine, type ChartInstance } from './engine.js';
import type { ChartBase } from './ChartBase.js';
import type { ChartModel, ChartSkin } from './model.js';
export const chartCSS=commonCSS+`
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
`;
let nextId=0;
export class ChartView {
    readonly root:Template;
    private readonly currentModel=state<ChartModel|undefined>(undefined);
    private get model():ChartModel|undefined{return this.currentModel[0]();}
    private set model(value:ChartModel|undefined){this.currentModel[1](value);}
    private readonly failureState=state(false);
    private get failure():boolean{return this.failureState[0]();}
    private set failure(value:boolean){this.failureState[1](value);}
    private readonly engineLoading=state(false);
    private get loadingEngine():boolean{return this.engineLoading[0]();}
    private set loadingEngine(value:boolean){this.engineLoading[1](value);}
    private readonly keyboard=state(false);
    private get keyboardActive():boolean{return this.keyboard[0]();}
    private set keyboardActive(value:boolean){this.keyboard[1](value);}
    private readonly hovering=state(false);
    private get hoverActive():boolean{return this.hovering[0]();}
    private set hoverActive(value:boolean){this.hovering[1](value);}
    private node(name:string):HTMLElement {const node=this.root.refs[name]?.[0];if(!(node instanceof HTMLElement))throw new Error(`Chart ${name} is not mounted`);return node;}
    private get group():HTMLElement{return this.node('group');}
    private get plot():HTMLElement{return this.node('plot');}
    private instance?:ChartInstance;
    private alive=false;
    private revision=0;
    private scheduled=false;
    private observer?:ResizeObserver;
    private mutations?:MutationObserver;
    private scheme?:MediaQueryList;
    private reduced?:MediaQueryList;
    private windowChange=()=>this.refresh();
    private zoomRange:[number,number]=[0,100];
    private statusText = ():string => {
        const model=this.model;
        return this.owner.status==='error'||this.failure?this.owner.errorText:this.owner.status==='loading'||this.loadingEngine?this.owner.loadingText:model?.empty?this.owner.emptyText:model?.noMatch?this.owner.noMatchText:'';
    }
    private unavailable():boolean{return Boolean(this.statusText())||!this.model?.points.some(point=>point.y!==null);}
    private zoomVisible = ():boolean=> {return !this.model?.pie&&bool(this.owner.zoomable)&&!this.statusText();}
    private detailsText = ():string => {
        const point=this.model?this.owner.selected(this.model):undefined;
        return point?`${this.owner.pinned&&this.owner.pinnedText?this.owner.pinnedText+': ':''}${this.owner.pointText(point)}`:'';
    }
    constructor(private owner:ChartBase) {
        const id=`cb-chart-${++nextId}`;
        const button=(part:string,label:()=>string,action:()=>void,hidden=()=>false,icon?:string):Template=>html`
            <cb-button part=${part} label=${label} accessible-label=${label} icon-only=${Boolean(icon)} icon=${icon??''} variant="ghost" size="sm" hidden=${hidden}
                onaction=${(event:Event)=>{event.stopPropagation();action();}}></cb-button>`;
        this.root=html`<section part="chart" ref="group" role="group"
            aria-label=${()=>text(owner.heading)||owner.accessibleLabel} aria-describedby=${`${id}-description`}
            aria-busy=${when(or(is(() => owner.status, 'loading'), () => this.loadingEngine), 'true', 'false')}>
            <div part="title" id=${`${id}-title`} hidden=${isNot(() => text(owner.heading))}>${()=>text(owner.heading)}</div>
            <p part="description" id=${`${id}-description`} hidden=${isNot(() => text(owner.description))}>${()=>text(owner.description)}</p>
            <div part="legend" role="group" aria-label=${()=>owner.legendLabel}>
                ${repeat(()=>this.model?.legend??[],item=>html`<cb-button part="legend-item" exportparts="control:legend-item-control,label:legend-item-label,button-label:legend-item-label,icon:legend-item-icon,description:legend-item-description" variant="ghost" size="sm" pressed=${item.visible}
                    label=${item.name} accessible-label=${item.name} onchange=${(event:Event)=>{event.stopPropagation();owner.setItemVisible(item.id,!item.visible,this.model?.legend.map(item=>item.id)??[]);}}>
                    <span part="legend-swatch" slot="prefix" aria-hidden="true" style=${`background-color:${item.color}`}></span>
                    <span part="legend-label">${item.name}</span>
                </cb-button>`,{key:item=>item.id})}
            </div><div part="plot" ref="plot" aria-hidden="true" hidden=${is(this.statusText)}
                style=${()=>typeof owner.height==='number'&&Number.isFinite(owner.height)?`height:${clamp(owner.height,160,1200)}px`:null}></div>
            <p part="status" role="status" hidden=${isNot(this.statusText)}>${this.statusText}</p>
            <div part="actions">
                <cb-button part="navigator" exportparts="control:navigator-control,label:navigator-label,button-label:navigator-label,icon:navigator-icon,description:navigator-description" variant="ghost" size="sm" pressed=${()=>owner.pinned} label=${()=>owner.navigateLabel}
                    accessible-label=${()=>{const selected=this.model?owner.selected(this.model):undefined;return selected?`${owner.navigateLabel}: ${owner.pointText(selected)}`:owner.navigateLabel;}}
                    description=${()=>owner.instructionsText} disabled=${()=>this.unavailable()}
                    onchange=${(event:Event)=>{event.stopPropagation();this.pin();}}
                    onfocusin=${()=>{this.keyboardActive=true;this.showDetails(true);}}
                    onfocusout=${()=>{this.keyboardActive=false;if(!owner.pinned&&!this.hoverActive)this.instance?.dispatchAction({type:'downplay'});}}
                    onkeydown=${(event:KeyboardEvent)=>{
                        if(!this.model)return;
                        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)){event.preventDefault();event.stopPropagation();owner.navigate(this.model,event.key);this.showDetails(true);}
                        else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();owner.pinned=false;this.showDetails();}
                    }}></cb-button>
                ${button('unpin',()=>owner.unpinLabel,()=>{owner.pinned=false;this.showDetails();},isNot(() => owner.pinned))}
                ${button('show-all',()=>owner.showAllLabel,()=>owner.showAll(this.model?.legend.map(item=>item.id)??[]),isNot(() => this.model?.legend.some(item=>!item.visible)))}
                ${button('retry',()=>owner.retryLabel,()=>{this.failure=false;owner.emit('retry');this.refresh();},and(isNot(() => this.failure), isNot(() => owner.status, 'error')))}
                ${button('zoom-in',()=>owner.zoomInLabel,()=>this.zoom(.75),isNot(this.zoomVisible),'plus')}
                ${button('zoom-out',()=>owner.zoomOutLabel,()=>this.zoom(1.25),isNot(this.zoomVisible),'minus')}
                ${button('reset-zoom',()=>owner.resetZoomLabel,()=>this.zoom(0),isNot(this.zoomVisible),'reset')}
            </div><p part="instructions" id=${`${id}-keys`} hidden=${or(() => this.unavailable(), isNot(() => this.keyboardActive))}>${()=>owner.instructionsText}</p>
            <p part="details" role="status" hidden=${or(is(this.statusText), isNot(or(() => owner.pinned, () => this.keyboardActive, () => this.hoverActive)))}>${this.detailsText}</p>
            <cb-expandable-section part="data" exportparts="trigger:data-trigger,label:data-label,counter:data-counter,panel:data-panel,content:data-content"
                variant="default" heading-level="2" disable-content-padding label=${()=>owner.tableLabel}
                counter=${()=>this.model?.points.length?String(this.model.points.length):''} hidden=${isNot(() => this.model?.points.length)}>
                <cb-table part="data-table" exportparts="root:data-table-root,table:data-table-grid,head:data-table-head,row:data-table-row,cell:data-table-cell"
                    density="compact" resizable="false" wrap label=${()=>owner.tableLabel} empty-label=${()=>owner.emptyText} loading-label=${()=>owner.loadingText}
                    items=${pick(this.tableData, "rows")} columns=${pick(this.tableData, "columns")} item-key="id"></cb-table>
            </cb-expandable-section><span ref="probe" part="color-probe" hidden></span>
        </section>`;
    }
    mount(): void {
        this.alive = true;
        this.failure = false;
        if (typeof ResizeObserver !== 'undefined') {
            this.observer = new ResizeObserver(() => { this.instance?.resize(); this.refresh(); });
            this.observer.observe(this.owner);
        }
        this.scheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
        this.reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
        this.scheme?.addEventListener('change', this.windowChange);
        this.reduced?.addEventListener('change', this.windowChange);
        document.addEventListener('themechange', this.windowChange, true);
        window.addEventListener('resize', this.windowChange);
        this.mutations = new MutationObserver(this.windowChange);
        let ancestor: Node | null = this.owner;
        while (ancestor) {
            if (ancestor instanceof Element)
                this.mutations.observe(ancestor, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] });
            ancestor = ancestor.parentNode ?? (ancestor instanceof ShadowRoot ? ancestor.host : null);
        }
        this.refresh();
    }
    destroy(): void {
        this.alive = false;
        this.revision++;
        this.instance?.dispose();
        this.instance = undefined;
        this.observer?.disconnect();
        this.mutations?.disconnect();
        this.scheme?.removeEventListener('change', this.windowChange);
        this.reduced?.removeEventListener('change', this.windowChange);
        document.removeEventListener('themechange', this.windowChange, true);
        window.removeEventListener('resize', this.windowChange);
    }
    refresh(): void {
        if (!this.alive || this.scheduled)
            return;
        this.scheduled = true;
        queueMicrotask(() => {
            this.scheduled = false;
            if (this.alive)
                void this.draw().catch(error => { if (this.alive) {
                    this.failure = true;
                    this.loadingEngine = false;
                    this.owner.onError(error);

                } });
        });
    }
    private skin(): ChartSkin {
        const style = getComputedStyle(this.owner), read = (key: string) => style.getPropertyValue(key).trim() || lightTokens[key];
        // Resolve var() aliases through a real CSS property, as SVG/canvas engines do not resolve token strings.
        const probe = this.node('probe');
        const color = (key: string) => { probe.style.color = ''; probe.style.color = `var(${key}, ${lightTokens[key]})`; return getComputedStyle(probe).color; };
        const skin = { palette: [1, 2, 3, 4, 5, 6].map(n => color(`--custom-chart-series-${n}`)), text: color('--color-foreground'), muted: color('--color-muted-foreground'), border: color('--color-separator'), surface: color('--color-surface'), font: read('--typography-body-font-family'), fontSize: parseFloat(read('--component-chart-font-size')) || 12, motionDuration: cssMilliseconds(read('--motion-duration-normal')), reducedMotion: this.reduced?.matches ?? false };

        return skin;
    }
    private async draw(): Promise<void> {
        const rev = ++this.revision;
        this.model = this.owner.getModel(this.skin());
        this.showDetails();
        if (this.owner.status === 'loading' || this.owner.status === 'error' || this.failure || this.model.empty || this.model.noMatch) {
            if (this.instance)
                this.instance.setOption({ series: [] }, { notMerge: true });
            return;
        }
        this.loadingEngine = !this.instance;

        let engine;
        try {
            engine = this.instance ? undefined : await chartEngine();
        }
        catch (error) {
            if (!this.alive || rev !== this.revision)
                return;
            throw error;
        }
        if (!this.alive || rev !== this.revision)
            return;
        this.loadingEngine = false;

        if (!this.instance && engine) {
            this.instance = engine.init(this.plot, undefined, { renderer: 'svg' });
            this.instance.on('click', event => this.pick(event, true));
            this.instance.on('mouseover', event => { if (!this.owner.pinned)
                this.pick(event, false); });
            this.instance.on('globalout', () => { this.hoverActive = false; if (!this.owner.pinned && !this.keyboardActive)
                this.instance?.dispatchAction({ type: 'downplay' });  });
            this.instance.on('datazoom', event => {
                const input = record(event), batch = Array.isArray(input.batch) ? record(input.batch[0]) : input;
                if (typeof batch.start !== 'number' || typeof batch.end !== 'number' || !Number.isFinite(batch.start) || !Number.isFinite(batch.end))
                    return;
                const start = clamp(batch.start, 0, 100), end = clamp(batch.end, start, 100);
                if (start === this.zoomRange[0] && end === this.zoomRange[1])
                    return;
                this.zoomRange = [start, end];
                this.owner.emit('zoomchange', { start, end });
            });
        }
        this.instance?.setOption(this.model.option, { notMerge: true });
        this.plot.querySelector('svg')?.setAttribute('part', 'graphic');
        if (bool(this.owner.zoomable) && !this.model.pie)
            this.applyZoom();
        this.showDetails(this.owner.pinned || this.keyboardActive || this.hoverActive);
    }
    private pick(event: unknown, pinned: boolean): void {
        if (!this.model)
            return;
        const point = this.owner.enginePoint(this.model, event);
        if (point) {
            this.hoverActive = true;
            this.owner.select(point, pinned);
            this.showDetails(true);
        }
    }
    private pin(): void {
        if (!this.model)
            return;
        const p = this.owner.selected(this.model);
        if (p) {
            this.owner.select(p, !this.owner.pinned);
            this.showDetails(true);
        }
    }
    private showDetails(highlight = false): void {
        if (!this.model)
            return;
        const selected = this.owner.selected(this.model);

        if (selected && highlight && this.instance) {
            this.instance.dispatchAction({ type: 'downplay' });
            this.instance.dispatchAction({ type: 'highlight', seriesId: selected.seriesId, dataIndex: selected.index });
        }
        if (this.instance && !this.owner.pinned && !this.keyboardActive && !this.hoverActive)
            this.instance.dispatchAction({ type: 'downplay' });

    }
    private tableData = (): {rows:readonly TableRecord[];columns:readonly TableColumn[]} => {
        if (!this.model) return {rows:[],columns:[]};
        const points = this.model.points;

        const rows: TableRecord[] = points.map(point => ({
            id: point.key,
            series: point.seriesName,
            category: String(point.x),
            value: this.owner.format(point.y),
            range: point.low !== undefined && point.high !== undefined ? `${this.owner.format(point.low)}–${this.owner.format(point.high)}` : this.owner.missingText,
            size: this.owner.format(point.size),
            percentage: point.percentage !== undefined ? `${this.owner.format(point.percentage)}%` : this.owner.missingText,
        }));
        const columns: TableColumn[] = [
            { id: 'series', header: this.owner.seriesLabel, field: 'series', minWidth: 140 },
            { id: 'category', header: this.owner.categoryLabel, field: 'category', minWidth: 120 },
            { id: 'value', header: this.owner.valueLabel, field: 'value', minWidth: 100, align: 'end' },
        ];
        if (points.some(point => point.low !== undefined || point.high !== undefined))
            columns.push({ id: 'range', header: this.owner.rangeLabel, field: 'range', minWidth: 120, align: 'end' });
        if (points.some(point => point.size !== undefined))
            columns.push({ id: 'size', header: this.owner.sizeLabel, field: 'size', minWidth: 100, align: 'end' });
        if (points.some(point => point.percentage !== undefined))
            columns.push({ id: 'percentage', header: this.owner.percentageLabel, field: 'percentage', minWidth: 110, align: 'end' });
        return {rows,columns};
    }
    private zoom(factor: number): void {
        const center = (this.zoomRange[0] + this.zoomRange[1]) / 2, span = factor ? clamp((this.zoomRange[1] - this.zoomRange[0]) * factor, 5, 100) : 100;
        const start = clamp(center - span / 2, 0, 100 - span);
        this.zoomRange = [start, start + span];
        this.applyZoom();
        this.owner.emit('zoomchange', { start: start, end: start + span });
    }
    private applyZoom(): void { this.instance?.dispatchAction({ type: 'dataZoom', start: this.zoomRange[0], end: this.zoomRange[1] }); }
}
function cssMilliseconds(value: string): number { const duration = parseFloat(value); if (!Number.isFinite(duration) || duration < 0)
    return 160; return Math.min(2000, value.trim().endsWith('ms') ? duration : duration * 1000); }
