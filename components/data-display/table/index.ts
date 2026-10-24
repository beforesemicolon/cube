import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import { pick, isNot, or, is, and, type Template, html, repeat, when, state } from '../../core/runtime.js'

import { uid } from '../../core/id.js';
import { bool, finite, scalarText } from '../../core/value.js';

import { TableBase, type TableColumn, type TableRowModel } from './TableBase.js';

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
    stylesheet = componentStylesheet

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

register('cb-table', Table)
