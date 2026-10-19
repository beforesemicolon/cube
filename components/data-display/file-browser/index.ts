import { type Template, html, repeat, when } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { safeHref } from '../../core/url.js';
import type { TableColumn, TableRecord } from '../table/TableBase.js';
import { bool, scalarText } from '../../core/value.js';
import { FileBrowserBase, type FileBrowserEntry, type FileBrowserSort, type FileBrowserSortDirection, type FileBrowserView } from './FileBrowserBase.js';
interface FileRecord extends TableRecord {
    id: string;
    name: string;
    type: string;
    size: number | string;
    modified: string;
}
const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0;container-type:inline-size}
[part~=browser]{display:grid;grid-template-rows:auto auto minmax(0,1fr);min-block-size:260px;overflow:hidden;border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface)}
[part~=toolbar]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px);padding:var(--spacing-sm,8px);border-block-end:1px solid var(--color-separator);background:var(--color-surface-muted)}
[part~=toolbar-main]{display:flex;align-items:center;gap:var(--spacing-sm,8px);min-inline-size:0;flex:1}[part~=search]{display:block;inline-size:min(280px,100%)}
[part~=path]{padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border-block-end:1px solid var(--color-separator)}
[part~=content]{min-inline-size:0;min-block-size:0;overflow:auto;padding:var(--spacing-sm,8px)}
[part~=grid]{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(160px,100%),1fr));gap:var(--spacing-sm,8px)}
[part~=entry]{display:block;min-inline-size:0;min-block-size:132px;padding:0;text-align:start;background:var(--color-surface);border:1px solid var(--color-separator);border-radius:var(--radius-sm)}
[part~=entry]::part(control){display:grid;grid-template-rows:minmax(80px,1fr) auto;gap:var(--spacing-sm,8px);inline-size:100%;min-block-size:130px;padding:var(--spacing-sm,8px);text-align:inherit}
[part~=entry]::part(button-label){display:contents}
[part~=entry][aria-selected=true]{border-color:var(--color-primary);background:var(--color-selection)}[part~=entry-preview]{display:grid;place-items:center;overflow:hidden;border-radius:var(--radius-sm);background:var(--color-surface-muted)}
[part~=entry-preview] img{inline-size:100%;block-size:100%;object-fit:cover}[part~=entry-icon]{inline-size:32px;block-size:32px;color:var(--color-primary)}
[part~=entry-copy]{display:grid;min-inline-size:0}[part~=entry-name]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}[part~=entry-meta]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px)}
[part~=state]{display:grid;place-items:center;min-block-size:180px;color:var(--color-muted-foreground);text-align:center}
@container(max-width:520px){[part~=toolbar]{align-items:stretch;flex-direction:column}[part~=toolbar-main]{inline-size:100%}[part~=search]{inline-size:100%}}
`;
export class FileBrowser extends FileBrowserBase {
    render(): Template {
        return html`<style part="styles">${css}</style><section part="browser" aria-label=${() => this.accessibleName()}>
            <div part="toolbar"><div part="toolbar-main">
                <cb-text-input part="search" hidden=${()=>!bool(this.searchable)} accessible-label=${()=>this.searchLabel} placeholder=${()=>this.searchPlaceholder}
                    value=${()=>scalarText(this.query)} disabled=${()=>this.unavailable}
                    onchange=${(event:CustomEvent<{value:string}>)=>{event.stopPropagation();this.setQuery(event.detail.value,event);}}></cb-text-input>
                <slot name="toolbar" part="toolbar-content"></slot></div>
                <cb-segmented-control part="view-toggle" accessible-label=${()=>this.accessibleName()} value=${()=>this.view} disabled=${()=>this.unavailable}
                    items=${()=>[{id:'grid',label:this.gridViewLabel,icon:'grid'},{id:'table',label:this.tableViewLabel,icon:'layers'}]}
                    onchange=${(event:CustomEvent<{value:FileBrowserView}>)=>{event.stopPropagation();this.setView(event.detail.value,event);}}></cb-segmented-control>
            </div><cb-breadcrumb part="path" accessible-label=${()=>this.breadcrumbLabel} expand-label=${()=>this.expandPathLabel}
                items=${()=>this.pathItems().map(item=>({id:item.id?`folder:${item.id}`:'root:',label:item.label}))}
                onnavigate=${(event:CustomEvent<{id:string}>)=>{event.stopPropagation();const id=event.detail.id;this.navigate(id.startsWith('folder:')?id.slice(7):'',event);}}></cb-breadcrumb>
            <div part="content">${when(()=>bool(this.loading),()=>html`<div part="state"><cb-skeleton variant=${()=>this.view==='table'?'table':'card'} rows="4" columns="3" accessible-label=${()=>this.loadingLabel}></cb-skeleton></div>`,
                ()=>when(()=>!this.visibleEntries().length,()=>html`<div part="state" role="status">${()=>scalarText(this.query).trim()?this.noMatchLabel:this.emptyLabel}</div>`,
                ()=>when(()=>this.view==='table',()=>this.tableTemplate(),()=>this.gridTemplate())))}</div>
        </section>`;
    }
    private gridTemplate(): Template {
        return html`<div part="grid" role=${()=>this.selectionMode==='none'?'list':'listbox'} aria-multiselectable=${()=>this.selectionMode==='multiple'?true:null}>
            ${repeat(()=>this.visibleEntries(),entry=>html`<cb-button part="entry" exportparts="control:entry-control,label:entry-label,button-label:entry-label,icon:entry-icon,description:entry-description" data-bare data-semantic-host data-id=${entry.id}
                disabled=${()=>this.unavailable||entry.disabled===true} role=${()=>this.selectionMode==='none'?'listitem':'option'}
                aria-selected=${()=>this.selectionMode==='none'?null:this.selectedIds.includes(entry.id)}
                accessible-label=${()=>this.entryActionLabel(entry,this.selectedIds.includes(entry.id))}
                onaction=${(event:Event)=>{event.stopPropagation();entry.type==='folder'?this.activate(entry,event):this.select(entry,event);}}
                ondblclick=${(event:MouseEvent)=>this.activate(entry,event)}>
                <span part="entry-preview">${when(()=>Boolean(safeHref(entry.thumbnail,this.baseURI)),()=>html`<img src=${()=>safeHref(entry.thumbnail,this.baseURI)} alt="">`,
                    ()=>html`<cb-icon name=${entry.type==='folder'?'folder':'file'} part="entry-icon icon" decorative></cb-icon>`)}</span>
                <span part="entry-copy"><span part="entry-name">${entry.name}</span><span part="entry-meta">${entry.description||entry.mime||entry.type}</span></span>
            </cb-button>`,{key:entry=>entry.id})}</div>`;
    }
    private tableTemplate(): Template {
        return html`<cb-table part="table" label=${()=>this.accessibleName()} accessible-label=${()=>this.accessibleName()}
            items=${()=>this.visibleEntries().map(entry=>({id:entry.id,name:entry.name,type:entry.type,size:entry.size??'',modified:entry.modified??''}))}
            columns=${()=>this.tableColumns()} selection-mode=${()=>this.selectionMode} selected-keys=${()=>[...this.selectedIds]} item-key="id" row-activation
            sort-by=${()=>this.sortBy} sort-direction=${()=>this.sortDirection} resizable sticky-header
            select-row-label=${()=>scalarText(this.selectEntryLabel).replaceAll('{entry}','{row}')} deselect-row-label=${()=>scalarText(this.deselectEntryLabel).replaceAll('{entry}','{row}')}
            sort-ascending-label=${()=>this.sortAscendingLabel} sort-descending-label=${()=>this.sortDescendingLabel}
            onselectionchange=${(event:CustomEvent<{selectedKeys:readonly string[]}>)=>{event.stopPropagation();this.setSelection(event.detail.selectedKeys,event);}}
            onrowactivate=${(event:CustomEvent<{key:string}>)=>{event.stopPropagation();const entry=this.visibleEntries().find(entry=>entry.id===event.detail.key);if(entry)this.activate(entry,event);}}
            onsortchange=${(event:CustomEvent<{sortBy:FileBrowserSort;sortDirection:FileBrowserSortDirection}>)=>{event.stopPropagation();this.changeSort(event.detail.sortBy,event.detail.sortDirection,event);}}></cb-table>`;
    }
    private tableColumns(): readonly TableColumn<FileRecord>[] {
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
