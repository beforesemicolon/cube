import { elementRefs } from '../../core/refs.js'
import { pick, isNot, or, is, and, css as componentStyles, type Template, html, repeat, when, state } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { uid } from '../../core/id.js';
import { bool, finite, scalarText } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import { TableBase, type TableColumn, type TableRowModel } from './TableBase.js';
const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0;container-type:inline-size}
[part~=root]{display:grid;min-inline-size:0;contain:paint;border:1px solid var(--component-table-border,${v('--color-separator')});border-radius:var(--component-table-radius,var(--radius-md));background:var(--component-table-background,${v('--color-surface')});box-shadow:var(--component-table-shadow,none);overflow:hidden}
[part~=header],[part~=footer]{display:block}:host(:not(:has([slot=header]))) [part~=header],:host(:not(:has([slot=footer]))) [part~=footer]{display:none}
[part~=viewport]{inline-size:100%;min-inline-size:0;max-inline-size:100%;overflow:auto;max-block-size:var(--component-table-max-height,none);overscroll-behavior:contain;scrollbar-gutter:stable}
[part~=viewport]:focus-visible{outline:var(--focus-ring);outline-offset:-2px}
[part~=table]{border-collapse:separate;border-spacing:0;table-layout:fixed;inline-size:100%;min-inline-size:var(--table-resolved-min-width,var(--component-table-min-width,640px));color:${v('--color-foreground')}}
[part~=column-group],[part~=column],[part~=selection-column]{border:0}
[part~=caption]{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
[part~=head]{background:var(--component-table-header-background,${v('--color-surface-muted')})}
[part~=header-row]{block-size:var(--component-table-header-height,40px)}
[part~=header-cell],[part~=group-header-cell]{position:relative;padding:var(--component-table-cell-padding-block,var(--spacing-sm,8px)) var(--component-table-cell-padding-inline,var(--spacing-md,12px));border-block-end:1px solid ${v('--color-separator')};color:${v('--color-muted-foreground')};font-size:var(--component-table-header-font-size,11px);font-weight:600;letter-spacing:.02em;text-align:start;vertical-align:middle;background:var(--component-table-header-background,${v('--color-surface-muted')})}
[part~=group-header-cell]{text-transform:uppercase;font-size:10px;letter-spacing:.08em}
:host([data-sticky-header]) [part~=head]{position:sticky;inset-block-start:0;z-index:4}
[part~=header-content]{display:flex;align-items:center;min-inline-size:0;gap:var(--spacing-xs,4px)}
[part~=header-label]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[part~=sort-button],[part~=expand-button],[part~=group-button]{--component-button-min-width:24px;--component-control-height:24px;--component-control-height-sm:24px;flex:none}
[part~=sort-button][data-active]{color:${v('--color-primary')}}
[part~=resizer]{position:absolute;z-index:2;inset-block:5px;inset-inline-end:-5px;inline-size:10px;cursor:col-resize;touch-action:none}
[part~=resizer]::after{content:'';position:absolute;inset-block:0;inset-inline-start:4px;inline-size:1px;background:${v('--color-separator')};transition:background-color var(--motion-duration-fast) ease-out,inline-size var(--motion-duration-fast) ease-out}
[part~=resizer]:hover::after,[part~=resizer]:focus-visible::after,[part~=resizer][data-resizing]::after{inline-size:2px;background:${v('--color-primary')}}
[part~=row]{display:table-row;block-size:var(--component-table-row-height,44px);background:${v('--color-surface')};transition:background-color var(--motion-duration-fast) ease-out}
:host([data-striped]) [part~=row]:nth-of-type(even){background:var(--component-table-stripe,${v('--color-surface-muted')})}
[part~=row]:hover,[part~=row]:hover [part~=cell]{background:${v('--color-active')}}
[part~=row][data-active],[part~=row][data-active] [part~=cell]{background:${v('--color-selection')}}[part~=row][data-active]{box-shadow:inset 3px 0 0 ${v('--color-primary')}}
[part~=row][data-selected],[part~=row][data-selected] [part~=cell]{background:color-mix(in srgb,${v('--color-selection')} 72%,${v('--color-surface')})}
[part~=row][tabindex]:focus-visible{outline:var(--focus-ring);outline-offset:-2px}
[part~=cell]{padding:var(--component-table-cell-padding-block,var(--spacing-sm,8px)) var(--component-table-cell-padding-inline,var(--spacing-md,12px));border-block-end:1px solid ${v('--color-separator')};vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
:host([data-wrap]) [part~=cell],[part~=cell][data-wrap]{white-space:normal;overflow-wrap:anywhere}
[part~=cell][data-align=center],[part~=header-cell][data-align=center]{text-align:center}[part~=cell][data-align=end],[part~=header-cell][data-align=end]{text-align:end;font-variant-numeric:tabular-nums}
[part~=cell][data-variant=success]{color:${v('--color-success')}}[part~=cell][data-variant=warning]{color:${v('--color-warning')}}[part~=cell][data-variant=danger]{color:${v('--color-danger')}}[part~=cell][data-variant=muted]{color:${v('--color-muted-foreground')}}
[part~=primary-cell]{padding-inline-start:var(--component-table-cell-padding-inline,var(--spacing-md,12px))}
[part~=tree-cell]{display:flex;align-items:center;min-inline-size:0;gap:var(--spacing-xs,4px);block-size:100%}
[part~=tree-indent]{position:relative;align-self:stretch;inline-size:calc(var(--table-depth,0) * var(--component-table-tree-indent,28px));min-block-size:24px;flex:none;background:repeating-linear-gradient(to right,transparent 0 calc(var(--component-table-tree-indent,28px) - 1px),color-mix(in srgb,${v('--color-separator')} 74%,transparent) calc(var(--component-table-tree-indent,28px) - 1px) var(--component-table-tree-indent,28px))}
[part~=tree-indent]::after{content:'';position:absolute;inset-inline-end:0;inset-block-start:50%;inline-size:calc(var(--component-table-tree-indent,28px) * .4);border-block-start:1px solid ${v('--color-separator')}}
[part~=tree-spacer]{inline-size:24px;flex:none}[part~=cell-content]{min-inline-size:0;overflow:hidden;text-overflow:inherit}
[part~=row][data-parent] [part~=primary-cell] [part~=cell-content]{font-weight:600}
[part~=selection-cell]{inline-size:44px;min-inline-size:44px;max-inline-size:44px;text-align:center;padding-inline:var(--spacing-sm,8px)}
[part~=selection-control]{appearance:none;display:inline-grid;place-items:center;inline-size:16px;block-size:16px;margin:0;border:1px solid ${v('--color-border')};background:${v('--color-surface')};cursor:pointer}
input[type=checkbox][part~=selection-control]{border-radius:var(--radius-xs,3px)}input[type=radio][part~=selection-control]{border-radius:50%}
[part~=selection-control]:checked{border-color:${v('--color-primary')};background:${v('--color-primary')}}[part~=selection-control]:checked::after{content:'';inline-size:7px;block-size:4px;border-inline-start:2px solid ${v('--color-primary-foreground')};border-block-end:2px solid ${v('--color-primary-foreground')};rotate:-45deg;translate:0 -1px}
input[type=radio][part~=selection-control]:checked::after{inline-size:6px;block-size:6px;border:0;border-radius:50%;background:${v('--color-primary-foreground')};rotate:0;translate:0}
[part~=selection-control]:indeterminate{border-color:${v('--color-primary')};background:${v('--color-primary')}}[part~=selection-control]:indeterminate::after{content:'';inline-size:8px;block-size:2px;background:${v('--color-primary-foreground')}}
[part~=selection-control]:disabled{cursor:not-allowed;opacity:var(--component-disabled-opacity,.5)}
[part~=group-row]{background:var(--component-table-group-background,${v('--color-surface-muted')})}[part~=group-cell]{padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border-block-end:1px solid ${v('--color-separator')}}[part~=group-content]{display:flex;align-items:center;gap:var(--spacing-xs,4px);font-weight:600}[part~=group-count]{color:${v('--color-muted-foreground')};font-variant-numeric:tabular-nums}
[part~=empty],[part~=loading]{display:grid;place-items:center;min-block-size:var(--component-table-state-height,160px);padding:var(--spacing-lg,20px);color:${v('--color-muted-foreground')};text-align:center}[part~=loading]{display:block}
[part~=sticky]{position:sticky;inset-inline-start:var(--table-sticky-offset,0);z-index:2;box-shadow:1px 0 ${v('--color-separator')};background:inherit}[part~=header-cell][part~=sticky],[part~=group-header-cell][part~=sticky]{z-index:5;background:var(--component-table-header-background,${v('--color-surface-muted')})}
[part~=live]{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
:host([data-resizing]),:host([data-resizing]) *{cursor:col-resize!important;user-select:none!important}
:host([data-density=compact]){--component-table-row-height:34px;--component-table-header-height:34px;--component-table-cell-padding-block:4px;--component-table-cell-padding-inline:8px}
@container (max-width:560px){[part~=table]{--component-table-cell-padding-inline:8px;--component-table-min-width:520px}[part~=resizer]{display:none}}
@media(pointer:coarse){[part~=resizer]{display:none}[part~=sort-button],[part~=expand-button],[part~=group-button]{--component-control-height:36px;--component-control-height-sm:36px}}
@media(forced-colors:active){[part~=row][data-active],[part~=row][data-selected]{outline:2px solid Highlight;outline-offset:-2px}}
`;
function cssSize(value: string | number | undefined, fallback = 'auto'): string {
    return typeof value === 'number' && Number.isFinite(value) ? `${value}px` : scalarText(value).trim() || fallback;
}
function pixels(value: string | number | undefined, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    const parsed = Number.parseFloat(scalarText(value));
    return Number.isFinite(parsed) ? parsed : fallback;
}
const selectionColumnWidth = 44;
const defaultColumnWidth = 160;
export class Table extends TableBase {
    stylesheet = componentStyles`${css}`

    private readonly radioName=uid('cb-table-selection');
    private readonly widths=state<ReadonlyMap<string,number>>(new Map());
    private readonly offsets=state<ReadonlyMap<number,number>>(new Map());
    private readonly liveText=state('');
    private get columnWidths(): ReadonlyMap<string,number> { return this.widths[0](); }
    private get container(): HTMLElement | undefined { const node=this.refs.container?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private get viewport(): HTMLElement | undefined { const node=this.refs.viewport?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private grouped = (): boolean => { return this.columnList().some(column=>scalarText(column.group)); }
    private selected = (): boolean => { return this.normalizedSelectionMode() !== 'none'; }
    private sticky(index:number): boolean { return index < Math.max(0,Math.round(finite(this.stickyColumns,0))); }
    private stickyIndex(index:number): number { return index+(this.selected()?1:0); }
    private stickyStyle(index:number): string { return `--table-sticky-offset:${this.offsets[0]().get(index) ?? 0}px`; }
    private columnGroups = (): readonly {label:string;span:number;index:number}[] => {
        const columns=this.columnList(),groups:{label:string;span:number;index:number}[]=[];
        for(let index=0;index<columns.length;) {
            const label=scalarText(columns[index]?.group); let span=1;
            while(index+span<columns.length && scalarText(columns[index+span]?.group) === label) span++;
            groups.push({label,span,index}); index+=span;
        } return groups;
    }
    private tableStyle = (): string => {
        const columns=this.columnList(), selection=this.selected()?selectionColumnWidth:0;
        const minimum=Math.max(320,selection+columns.reduce((sum,column)=>sum+pixels(column.minWidth ?? column.width,defaultColumnWidth),0));
        const width=columns.every(column=>this.columnWidths.has(column.id)) ? `inline-size:max(100%,${Math.ceil(columns.reduce((sum,column)=>sum+(this.columnWidths.get(column.id) ?? 0),selection))}px)` : '';
        return `--table-resolved-min-width:${minimum}px;${width}`;
    }
    private iconAction(part:string,icon:()=>string,label:()=>string,handler:(event:Event)=>void,active=()=>false): Template {
        return html`<cb-button part=${part} icon-only icon=${icon} variant="ghost" size="xs" label=${label} accessible-label=${label}
            data-active=${() => active() ? '' : null} onclick=${(event:Event)=>event.stopPropagation()}
            onaction=${(event:Event)=>{event.stopPropagation();handler(event);}}></cb-button>`;
    }
    render(): Template {
        return html`<section part="root table-root" ref="container">
            <header part="header"><slot name="header" part="header-slot"></slot></header>
            <div part="viewport" ref="viewport" tabindex="0" aria-label=${() => this.accessibleName() || null}>
                ${when(this.props.loading, () => html`<div part="loading state"><cb-skeleton part="loading-skeleton" variant="table"
                    rows=${() => Math.max(1,Math.round(finite(this.loadingRows,5)))} columns=${() => Math.max(1,this.columnList().length)} animated accessible-label=${this.props.loadingLabel}></cb-skeleton></div>`,
                    () => when(or(isNot(pick(this.itemList, "length")), isNot(pick(this.columnList, "length"))), () => html`<div part="empty state" role="status"><slot name="empty" part="empty-slot">${this.props.emptyLabel}</slot></div>`,
                    () => html`<table part="table" style=${this.tableStyle}><caption part="caption">${this.accessibleName}</caption>
                        <colgroup part="column-group">${when(this.selected,()=>html`<col part="selection-column" style="width:44px">`)}
                            ${repeat(this.columnList,column=>html`<col part="column" data-column-id=${column.id} style=${()=>`width:${this.columnWidths.has(column.id)?`${this.columnWidths.get(column.id)}px`:cssSize(column.width ?? column.minWidth,'160px')}`}>`,{key:column=>column.id})}
                        </colgroup><thead part="head">
                            ${when(this.grouped,()=>html`<tr part="header-row group-header-row">
                                ${when(this.selected,()=>html`<th part="selection-cell group-header-cell sticky" rowspan="2" ref="cells" data-sticky-index="0" style=${()=>this.stickyStyle(0)}></th>`)}
                                ${repeat(this.columnGroups,group=>html`<th part=${()=>`group-header-cell${this.sticky(group.index)?' sticky':''}`}
                                    scope=${group.label?'colgroup':'col'} colspan=${group.label?group.span:null} rowspan=${group.label?null:2}
                                    ref="cells" data-sticky-index=${()=>this.sticky(group.index)?this.stickyIndex(group.index):null} style=${()=>this.stickyStyle(this.stickyIndex(group.index))}>${group.label}</th>`,{key:group=>group.index})}
                            </tr>`)}
                            <tr part="header-row">${when(this.selected,()=>html`<th part="header-cell selection-cell sticky" scope="col" hidden=${this.grouped} ref="cells" data-sticky-index="0" style=${()=>this.stickyStyle(0)}>
                                ${when(is(this.normalizedSelectionMode, 'multiple'),()=>html`<input part="selection-control" type="checkbox" checked=${this.allVisibleSelected} indeterminate=${this.someVisibleSelected}
                                    disabled=${or(() => this.unavailable, isNot(pick(this.selectableRows, "length")))} aria-label=${()=>scalarText(this.allVisibleSelected()?this.deselectAllLabel:this.selectAllLabel)||this.accessibleName()}
                                    onclick=${(event:Event)=>event.stopPropagation()} onchange=${(event:Event)=>{event.stopPropagation();this.toggleAllRows(event);}}>`)}
                            </th>`)}
                            ${repeat(this.columnList,(column,index)=>this.headerTemplate(column,index),{key:column=>column.id})}
                            </tr></thead><tbody part="body">${repeat(this.groupedRows,group=>html`
                                ${when(is(group.key),()=>html`<tr part="group-row"><th part="group-cell" colspan=${()=>this.columnList().length+(this.selected()?1:0)}>
                                    <div part="group-content">${this.iconAction('group-button',()=>this.collapsedGroupKeySet().has(group.key)?'right':'down',
                                        ()=>scalarText(this.collapsedGroupKeySet().has(group.key)?this.expandGroupLabel:this.collapseGroupLabel).replaceAll('{group}',group.label)||group.label,event=>this.toggleGroup(group.key,event))}
                                        <span part="group-label">${group.label}</span><span part="group-count">${group.rows.length}</span></div></th></tr>`)}
                                ${repeat(()=>group.key && this.collapsedGroupKeySet().has(group.key)?[]:group.rows,(row,index)=>this.rowTemplate(row,index),{key:row=>row.key})}
                            `,{key:group=>group.key})}</tbody></table>`))}
            </div><footer part="footer"><slot name="footer" part="footer-slot"></slot></footer>
            <div part="live" aria-live="polite" aria-atomic="true">${this.liveText[0]}</div>
        </section>`.onUpdate(()=>{queueMicrotask(()=>this.applyStickyOffsets());});
    }
    private headerTemplate(column:TableColumn,index:number): Template {
        return html`<th part=${()=>`header-cell${this.sticky(index)?' sticky':''}`} scope="col" data-column-id=${column.id} data-align=${column.align??'start'}
            hidden=${and(this.grouped, isNot(() => scalarText(column.group)))} ref="cells" data-sticky-index=${()=>this.sticky(index)?this.stickyIndex(index):null} style=${()=>this.stickyStyle(this.stickyIndex(index))}
            aria-sort=${()=>this.isSortable(column)?scalarText(this.sortBy)===column.id?`${this.normalizedSortDirection()}ending`:'none':null}>
            <span part="header-content"><span part="header-label">${()=>scalarText(column.header)}</span>
                ${when(()=>this.isSortable(column),()=>this.iconAction('sort-button',()=>scalarText(this.sortBy)===column.id && this.normalizedSortDirection()==='asc'?'up':'down',()=>this.sortLabel(column),event=>this.changeSort(column,event),is(this.props.sortBy, column.id)))}
            </span>${when(this.props.resizable,()=>html`<span part="resizer" role="separator" aria-orientation="vertical" tabindex="0" data-column-id=${column.id}
                aria-label=${()=>scalarText(this.resizeColumnLabel).replaceAll('{column}',scalarText(column.ariaLabel)||scalarText(column.header))||scalarText(column.header)}
                aria-valuemin=${()=>Math.round(pixels(column.minWidth,72))} aria-valuemax=${()=>Math.round(pixels(column.maxWidth,2000))}
                aria-valuenow=${()=>Math.round(this.columnWidths.get(column.id)??pixels(column.width??column.minWidth,160))}
                onpointerdown=${(event:PointerEvent)=>{if(event.currentTarget instanceof HTMLElement)this.startResize(column,event.currentTarget,event);}}
                onkeydown=${(event:KeyboardEvent)=>this.resizeKey(column,event)}></span>`)}</th>`;
    }
    private rowTemplate(row:TableRowModel,index:number): Template {
        return html`<tr part="row data-row" data-row-key=${row.key} data-parent-key=${row.parentKey} data-depth=${row.depth}
            data-child=${row.depth>0?'':null} data-parent=${row.hasChildren?'':null}
            data-expanded=${()=>row.hasChildren && this.expandedKeySet().has(row.key)?'':null}
            data-selected=${()=>this.selectedKeySet().has(row.key)?'':null} data-active=${()=>scalarText(this.activeKey)===row.key?'':null}
            aria-current=${()=>scalarText(this.activeKey)===row.key?true:null} tabindex=${()=>bool(this.rowActivation)&&!this.unavailable?0:null}
            onclick=${(event:Event)=>{if(bool(this.rowActivation)&&!this.unavailable&&event.currentTarget instanceof HTMLTableRowElement&&!this.isInteractiveEvent(event,event.currentTarget))this.activateRow(row,index,event);}}
            onkeydown=${(event:KeyboardEvent)=>{if(bool(this.rowActivation)&&!this.unavailable&&event.target===event.currentTarget&&['Enter',' '].includes(event.key)){event.preventDefault();this.activateRow(row,index,event);}}}>
            ${when(this.selected,()=>html`<td part="cell selection-cell sticky" ref="cells" data-sticky-index="0" style=${()=>this.stickyStyle(0)}>
                <input part="selection-control" type=${()=>this.normalizedSelectionMode()==='single'?'radio':'checkbox'} name=${()=>this.normalizedSelectionMode()==='single'?this.radioName:null}
                    checked=${()=>this.selectedKeySet().has(row.key)} disabled=${or(() => this.unavailable, isNot(() => this.isSelectable(row.item)))}
                    aria-label=${()=>this.rowLabel(this.selectedKeySet().has(row.key)?this.deselectRowLabel:this.selectRowLabel,row)}
                    onclick=${(event:Event)=>event.stopPropagation()} onchange=${(event:Event)=>{event.stopPropagation();this.toggleRowSelection(row,event);}}></td>`)}
            ${repeat(this.columnList,(column,columnIndex)=>html`<td part=${()=>`cell${columnIndex===0?' primary-cell':''}${this.sticky(columnIndex)?' sticky':''}`}
                data-align=${column.align??'start'} data-column-id=${column.id} data-variant=${()=>this.cellVariant(column,row,index)} data-wrap=${()=>bool(column.wrap)?'':null}
                ref="cells" data-sticky-index=${()=>this.sticky(columnIndex)?this.stickyIndex(columnIndex):null} style=${()=>this.stickyStyle(this.stickyIndex(columnIndex))}>
                ${when(columnIndex===0, () => html`<div part="tree-cell">${when(row.depth>0,()=>html`<span part="tree-indent" aria-hidden="true" style=${`--table-depth:${row.depth}`}></span>`)}
                    ${row.hasChildren?this.iconAction('expand-button',()=>this.expandedKeySet().has(row.key)?'down':'right',()=>this.rowLabel(this.expandedKeySet().has(row.key)?this.collapseRowLabel:this.expandRowLabel,row),event=>this.toggleExpanded(row,event)):html`<span part="tree-spacer"></span>`}
                    <span part="cell-content">${()=>this.cellContent(column,row,index)??''}</span></div>`, () => html`${()=>this.cellContent(column,row,index)??''}`)}
            </td>`,{key:column=>column.id})}</tr>`;
    }
    protected syncView(): void {
        this.dataset.density=this.normalizedDensity(); this.toggleAttribute('data-striped',bool(this.striped));
        this.toggleAttribute('data-wrap',bool(this.wrap)); this.toggleAttribute('data-sticky-header',bool(this.stickyHeader));
        this.liveText[1](this.announcement); queueMicrotask(()=>this.applyStickyOffsets());
    }
    private resizeKey(column:TableColumn,event:KeyboardEvent): void {
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();this.freezeColumnWidths();
        const current=this.columnWidths.get(column.id)??pixels(column.width??column.minWidth,160);
        this.resizeColumn(column,event.key==='Home'?pixels(column.minWidth,72):event.key==='End'?pixels(column.maxWidth,2000):current+(event.key==='ArrowRight'?16:-16));
    }
    private startResize(column: TableColumn, handle: HTMLElement, event: PointerEvent): void {
        if (event.button !== 0)
            return;
        event.preventDefault();
        event.stopPropagation();
        this.freezeColumnWidths();
        const header = handle.closest('th');
        if (!(header instanceof HTMLElement))
            return;
        const startX = event.clientX;
        const startWidth = this.columnWidths.get(column.id) ?? header.getBoundingClientRect().width;
        const viewport = this.viewport;
        const startScrollLeft = viewport?.scrollLeft ?? 0;
        const preserveScrollPosition = (): void => {
            if (viewport)
                viewport.scrollLeft = startScrollLeft;
        };
        let finished = false;
        const move = (moveEvent: PointerEvent): void => {
            moveEvent.preventDefault();
            this.resizeColumn(column, startWidth + moveEvent.clientX - startX, false);
            preserveScrollPosition();
            queueMicrotask(preserveScrollPosition);
        };
        const stop = (endEvent: PointerEvent): void => {
            if (finished)
                return;
            finished = true;
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', stop);
            handle.removeEventListener('pointercancel', stop);
            handle.removeEventListener('lostpointercapture', stop);
            if (handle.hasPointerCapture(event.pointerId))
                handle.releasePointerCapture(event.pointerId);
            handle.toggleAttribute('data-resizing', false);
            this.toggleAttribute('data-resizing', false);
            preserveScrollPosition();
            this.emit('columnresize', { column, width: this.columnWidths.get(column.id), originalEvent: endEvent });
        };
        handle.setPointerCapture(event.pointerId);
        handle.toggleAttribute('data-resizing', true);
        this.toggleAttribute('data-resizing', true);
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
        handle.addEventListener('lostpointercapture', stop);
    }
    private resizeColumn(column:TableColumn,proposed:number,announce=true): void {
        const width=Math.min(pixels(column.maxWidth,Infinity),Math.max(pixels(column.minWidth,72),proposed));
        this.widths[1](new Map(this.columnWidths).set(column.id,width));
        queueMicrotask(()=>this.applyStickyOffsets());
        if(announce)this.emit('columnresize',{column,width});
    }
    private freezeColumnWidths(): void {
        const headers=elementRefs(this.refs.cells).filter(cell=>cell.localName==='th'&&cell.hasAttribute('data-column-id')),widths=new Map(this.columnWidths);
        for(const column of this.columnList()){
            const width=headers.find(header=>header.dataset.columnId===column.id)?.getBoundingClientRect().width;
            if(width && width>0)widths.set(column.id,width);
        }this.widths[1](widths);
    }
    private applyStickyOffsets(): void {
        const cells=elementRefs(this.refs.cells).filter(cell => cell.hasAttribute('data-sticky-index')),widths=new Map<number,number>(),offsets=new Map<number,number>();
        for(const cell of cells){const index=Number(cell.dataset.stickyIndex);if(!widths.has(index))widths.set(index,cell.getBoundingClientRect().width);}
        for(const index of widths.keys()){let offset=0;for(let current=0;current<index;current++)offset+=widths.get(current)??0;offsets.set(index,offset);}
        const current=this.offsets[0]();
        if(current.size!==offsets.size || [...offsets].some(([index,offset])=>current.get(index)!==offset))this.offsets[1](offsets);
    }
    private isInteractiveEvent(event: Event, row: HTMLTableRowElement): boolean {
        return event.composedPath().some(target => target !== row && target instanceof Element && (target.matches('button,a,input,select,textarea,[role=button],[role=checkbox],[role=radio]') ||
            ['cb-button', 'cb-button', 'cb-link', 'cb-select', 'cb-checkbox', 'cb-radio-group'].includes(target.localName)));
    }
}
export { TableBase };
export type { TableAlign, TableCellContent, TableCellContext, TableCellVariant, TableColumn, TableDensity, TableGroupModel, TablePrimitive, TableProps, TableRecord, TableRowModel, TableSelectionMode, TableSortDirection, TableValue, } from './TableBase.js';
