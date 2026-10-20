import componentStylesheet from './styles.css?inline'
import { isNot, pick, is, or, type Template, html, repeat, when } from '../../core/runtime.js'

import { safeHref } from '../../core/url.js';
import type { TableColumn, TableRecord } from '../table/TableBase.js';
import { scalarText } from '../../core/value.js';
import { FileBrowserBase, type FileBrowserEntry, type FileBrowserSort, type FileBrowserSortDirection, type FileBrowserView } from './FileBrowserBase.js';
interface FileRecord extends TableRecord {
    id: string;
    name: string;
    type: string;
    size: number | string;
    modified: string;
}

export class FileBrowser extends FileBrowserBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<section part="browser" aria-label=${this.accessibleName}>
            <div part="toolbar"><div part="toolbar-main">
                <cb-text-input part="search" hidden=${isNot(this.props.searchable)} accessible-label=${this.props.searchLabel} placeholder=${this.props.searchPlaceholder}
                    value=${this.props.query} disabled=${()=>this.unavailable}
                    onchange=${(event:CustomEvent<{value:string}>)=>{event.stopPropagation();this.setQuery(event.detail.value,event);}}></cb-text-input>
                <slot name="toolbar" part="toolbar-content"></slot></div>
                <cb-segmented-control part="view-toggle" accessible-label=${this.accessibleName} value=${this.props.view} disabled=${()=>this.unavailable}
                    items=${()=>[{id:'grid',label:this.gridViewLabel,icon:'grid'},{id:'table',label:this.tableViewLabel,icon:'layers'}]}
                    onchange=${(event:CustomEvent<{value:FileBrowserView}>)=>{event.stopPropagation();this.setView(event.detail.value,event);}}></cb-segmented-control>
            </div><cb-breadcrumb part="path" accessible-label=${this.props.breadcrumbLabel} expand-label=${this.props.expandPathLabel}
                items=${()=>this.pathItems().map(item=>({id:item.id?`folder:${item.id}`:'root:',label:item.label}))}
                onnavigate=${(event:CustomEvent<{id:string}>)=>{event.stopPropagation();const id=event.detail.id;this.navigate(id.startsWith('folder:')?id.slice(7):'',event);}}></cb-breadcrumb>
            <div part="content">${when(this.props.loading,()=>html`<div part="state"><cb-skeleton variant=${()=>this.view==='table'?'table':'card'} rows="4" columns="3" accessible-label=${this.props.loadingLabel}></cb-skeleton></div>`,
                ()=>when(isNot(pick(this.visibleEntries, "length")),()=>html`<div part="state" role="status">${()=>scalarText(this.query).trim()?this.noMatchLabel:this.emptyLabel}</div>`,
                ()=>when(is(this.props.view, 'table'),this.tableTemplate,this.gridTemplate)))}</div>
        </section>`;
    }
    private gridTemplate = (): Template => {
        return html`<div part="grid" role=${()=>this.selectionMode==='none'?'list':'listbox'} aria-multiselectable=${()=>this.selectionMode==='multiple'?true:null}>
            ${repeat(this.visibleEntries,entry=>html`<cb-button part="entry" exportparts="control:entry-control,label:entry-label,button-label:entry-label,icon:entry-icon,description:entry-description" data-bare data-semantic-host data-id=${entry.id}
                disabled=${or(() => this.unavailable, is(entry.disabled, true))} role=${()=>this.selectionMode==='none'?'listitem':'option'}
                aria-selected=${()=>this.selectionMode==='none'?null:this.selectedIds.includes(entry.id)}
                accessible-label=${()=>this.entryActionLabel(entry,this.selectedIds.includes(entry.id))}
                onaction=${(event:Event)=>{event.stopPropagation();entry.type==='folder'?this.activate(entry,event):this.select(entry,event);}}
                ondblclick=${(event:MouseEvent)=>this.activate(entry,event)}>
                <span part="entry-preview">${when(is(() => safeHref(entry.thumbnail,this.baseURI)),()=>html`<img src=${()=>safeHref(entry.thumbnail,this.baseURI)} alt="">`,
                    ()=>html`<cb-icon name=${entry.type==='folder'?'folder':'file'} part="entry-icon icon" decorative></cb-icon>`)}</span>
                <span part="entry-copy"><span part="entry-name">${entry.name}</span><span part="entry-meta">${entry.description||entry.mime||entry.type}</span></span>
            </cb-button>`,{key:entry=>entry.id})}</div>`;
    }
    private tableTemplate = (): Template => {
        return html`<cb-table part="table" label=${this.accessibleName} accessible-label=${this.accessibleName}
            items=${()=>this.visibleEntries().map(entry=>({id:entry.id,name:entry.name,type:entry.type,size:entry.size??'',modified:entry.modified??''}))}
            columns=${this.tableColumns} selection-mode=${this.props.selectionMode} selected-keys=${()=>[...this.selectedIds]} item-key="id" row-activation
            sort-by=${this.props.sortBy} sort-direction=${this.props.sortDirection} resizable sticky-header
            select-row-label=${()=>scalarText(this.selectEntryLabel).replaceAll('{entry}','{row}')} deselect-row-label=${()=>scalarText(this.deselectEntryLabel).replaceAll('{entry}','{row}')}
            sort-ascending-label=${this.props.sortAscendingLabel} sort-descending-label=${this.props.sortDescendingLabel}
            onselectionchange=${(event:CustomEvent<{selectedKeys:readonly string[]}>)=>{event.stopPropagation();this.setSelection(event.detail.selectedKeys,event);}}
            onrowactivate=${(event:CustomEvent<{key:string}>)=>{event.stopPropagation();const entry=this.visibleEntries().find(entry=>entry.id===event.detail.key);if(entry)this.activate(entry,event);}}
            onsortchange=${(event:CustomEvent<{sortBy:FileBrowserSort;sortDirection:FileBrowserSortDirection}>)=>{event.stopPropagation();this.changeSort(event.detail.sortBy,event.detail.sortDirection,event);}}></cb-table>`;
    }
    private tableColumns = (): readonly TableColumn<FileRecord>[] => {
        return [
            {id:'name',header:this.nameLabel,field:'name',sortable:true,minWidth:200,cell:context=>html`<span part="file-name" style="display:inline-flex;align-items:center;gap:8px"><cb-icon name=${context.item.type==='folder'?'folder':'file'} part="icon" decorative></cb-icon>${context.item.name}</span>`},
            {id:'type',header:this.typeLabel,field:'type',sortable:true,width:120},
            {id:'size',header:this.sizeLabel,field:'size',sortable:true,align:'end',width:120},
            {id:'modified',header:this.modifiedLabel,field:'modified',sortable:true,width:160}
        ];
    }
    private entryActionLabel(entry: FileBrowserEntry, selected: boolean): string {
        const template = entry.type === 'folder' ? this.openEntryLabel : selected ? this.deselectEntryLabel : this.selectEntryLabel;
        return scalarText(template).replaceAll('{entry}', entry.name);
    }
}
export { FileBrowserBase };
export type { FileBrowserProps, FileBrowserEntry, FileBrowserPathItem, FileBrowserView, FileBrowserSelectionMode, FileBrowserSort, FileBrowserSortDirection } from './FileBrowserBase.js';
