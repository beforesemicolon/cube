import { type Template, html, repeat, when, state } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { iconPaths } from '../../icons/paths.js';
import { bool, scalarText } from '../../core/value.js';
import { LayerTreeBase, type LayerDropPosition, type LayerTreeItem } from './LayerTreeBase.js';
const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0}[part~=tree],[part~=group]{display:grid;gap:1px;margin:0;padding:0;list-style:none}[part~=group]{padding-inline-start:var(--component-tree-indent,20px)}
[part~=row]{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;align-items:center;gap:var(--spacing-xs,4px);min-block-size:30px;padding:2px var(--spacing-xs,4px);border:1px solid transparent;border-radius:var(--radius-sm);background:transparent;color:inherit}
[part~=row]:hover{background:var(--color-active)}[part~=row][aria-selected=true]{background:var(--color-selection);border-color:var(--color-primary)}[part~=row][data-hidden] [part~=label]{opacity:.55;font-style:italic}[part~=row][data-locked] [part~=label]{color:var(--color-muted-foreground)}
[part~=disclosure],[part~=action]{--component-button-min-width:24px;--component-control-height-sm:24px}[part~=spacer]{inline-size:24px}[part~=type-icon]{inline-size:16px;block-size:16px;color:var(--color-muted-foreground)}
[part~=copy]{display:grid;min-inline-size:0;text-align:start}[part~=label]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}[part~=description]{color:var(--color-muted-foreground);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[part~=actions]{display:flex;align-items:center;gap:1px;opacity:0}[part~=row]:hover [part~=actions],[part~=row]:focus-within [part~=actions],[part~=row][aria-selected=true] [part~=actions]{opacity:1}
[part~=empty]{padding:var(--spacing-md,12px);color:var(--color-muted-foreground);text-align:center}[part~=edit-row]{display:flex;align-items:center;gap:var(--spacing-xs,4px);min-inline-size:0}[part~=edit-input]{display:block;min-inline-size:100px;flex:1}
[part~=row][data-drop=before]{box-shadow:inset 0 2px var(--color-primary)}[part~=row][data-drop=after]{box-shadow:inset 0 -2px var(--color-primary)}[part~=row][data-drop=inside]{background:var(--color-selection);outline:1px solid var(--color-primary)}
`;
export class LayerTree extends LayerTreeBase {
    private readonly editing=state('');
    private readonly draft=state('');
    private get editingId(): string {return this.editing[0]();}
    private set editingId(id:string) {this.editing[1](id);}
    private draggingId='';
    private get tree(): HTMLElement | undefined {const node=this.refs.tree?.[0];return node instanceof HTMLElement?node:undefined;}
    render(): Template {
        return html`<style part="styles">${css}</style><div part="tree" ref="tree" role="tree" aria-label=${()=>this.accessibleName()}
            aria-multiselectable=${()=>bool(this.multiple)?true:null} onkeydown=${(event:KeyboardEvent)=>this.handleKey(event)}>
            ${when(()=>!this.normalizedItems().length,()=>html`<div part="empty" role="status">${()=>this.emptyLabel}</div>`)}
            ${this.itemsTemplate(()=>this.normalizedItems(),1)}</div>`;
    }
    private beginEdit(item:LayerTreeItem): void {
        this.draft[1](item.label);this.editingId=item.id;
        queueMicrotask(()=>{const node=this.refs.edit?.[0];if(node instanceof HTMLElement)node.focus();});
    }
    private itemsTemplate(items:()=>readonly LayerTreeItem[],level:number): Template {
        return html`${repeat(items,item=>html`<div part="item"><div part="row" data-id=${item.id} role="treeitem"
            tabindex=${()=>this.selectedIds.includes(item.id)||!this.selectedIds.length&&this.normalizedItems()[0]?.id===item.id?0:-1}
            aria-level=${level} aria-selected=${()=>this.selectedIds.includes(item.id)} aria-expanded=${()=>item.children?.length?this.expandedIds.includes(item.id):null}
            data-hidden=${()=>bool(item.hidden)?'':null} data-locked=${()=>bool(item.locked)?'':null}
            draggable=${()=>bool(this.reorderable)&&item.draggable!==false&&!item.disabled&&!this.unavailable}
            onclick=${(event:MouseEvent)=>{
                if(event.composedPath().some(node=>node!==event.currentTarget&&node instanceof Element&&(node.matches('button,input')||node.localName.startsWith('cb-'))))return;
                this.select(item.id,event.metaKey||event.ctrlKey,event);
            }} ondblclick=${(event:MouseEvent)=>{if(bool(this.editable)&&item.renamable!==false){this.beginEdit(item);event.preventDefault();}}}
            ondragstart=${(event:DragEvent)=>{this.draggingId=item.id;event.dataTransfer?.setData('text/plain',item.id);if(event.dataTransfer)event.dataTransfer.effectAllowed='move';}}
            ondragover=${(event:DragEvent)=>{if(event.currentTarget instanceof HTMLElement)this.dragOver(event.currentTarget,event);}}
            ondragleave=${(event:DragEvent)=>{if(event.currentTarget instanceof HTMLElement)event.currentTarget.removeAttribute('data-drop');}}
            ondrop=${(event:DragEvent)=>{if(event.currentTarget instanceof HTMLElement)this.drop(item.id,event.currentTarget,event);}}>
            ${item.children?.length?this.actionTemplate('disclosure',()=>this.expandedIds.includes(item.id)?'down':'right',
                ()=>this.itemLabel(this.expandedIds.includes(item.id)?this.collapseLabel:this.expandLabel,item),event=>this.toggleExpanded(item.id,event))
                :html`<span part="spacer"></span>`}
            <cb-icon name=${item.icon&&Object.hasOwn(iconPaths,item.icon)?item.icon:item.children?.length?'layers':'component'} part="type-icon icon" decorative></cb-icon>
            ${when(()=>this.editingId===item.id,()=>html`<span part="edit-row"><cb-text-input part="edit-input" ref="edit"
                value=${this.draft[0]} accessible-label=${()=>this.itemLabel(this.renameLabel,item)}
                onchange=${(event:CustomEvent<{value:string}>)=>{event.stopPropagation();this.draft[1](event.detail.value);}}
                onkeydown=${(event:KeyboardEvent)=>{if(event.key==='Enter'){event.preventDefault();this.commitRename(item,event);}else if(event.key==='Escape'){event.preventDefault();this.editingId='';}}}></cb-text-input>
                <cb-button part="save" exportparts="control:save-control,label:save-label,button-label:save-label,icon:save-icon,description:save-description" variant="ghost" size="sm" label=${()=>this.saveLabel} onaction=${(event:Event)=>{event.stopPropagation();this.commitRename(item,event);}}></cb-button>
                <cb-button part="cancel" exportparts="control:cancel-control,label:cancel-label,button-label:cancel-label,icon:cancel-icon,description:cancel-description" variant="ghost" size="sm" label=${()=>this.cancelLabel} onaction=${(event:Event)=>{event.stopPropagation();this.editingId='';}}></cb-button></span>`,
                ()=>html`<span part="copy"><span part="label">${item.label}</span><span part="description" hidden=${!item.description}>${item.description??''}</span></span><span part="actions">
                    ${when(()=>bool(this.showVisibility),()=>this.actionTemplate('action visibility',()=>bool(item.hidden)?'eyeOff':'eye',()=>this.itemLabel(bool(item.hidden)?this.showLabel:this.hideLabel,item),event=>this.toggleVisibility(item.id,event)))}
                    ${when(()=>bool(this.showLock),()=>this.actionTemplate('action lock',()=>bool(item.locked)?'lock':'unlock',()=>this.itemLabel(bool(item.locked)?this.unlockLabel:this.lockLabel,item),event=>this.toggleLock(item.id,event)))}
                    ${when(()=>bool(this.editable)&&item.renamable!==false,()=>this.actionTemplate('action rename',()=> 'text',()=>this.itemLabel(this.renameLabel,item),()=>this.beginEdit(item)))}
                </span>`)}
            </div>${when(()=>Boolean(item.children?.length)&&this.expandedIds.includes(item.id),()=>html`<div part="group" role="group">${this.itemsTemplate(()=>item.children??[],level+1)}</div>`)}</div>`,{key:item=>item.id})}`;
    }
    private actionTemplate(part:string,icon:()=>string,label:()=>string,handler:(event:Event)=>void): Template {
        return html`<cb-button part=${part} icon-only icon=${icon} variant="ghost" size="xs" accessible-label=${label} disabled=${()=>this.unavailable}
            onaction=${(event:Event)=>{event.stopPropagation();handler(event);}}></cb-button>`;
    }
    private commitRename(item:LayerTreeItem,event:Event): void {if(this.rename(item.id,this.draft[0](),event))this.editingId='';}
    private findItem(items:readonly LayerTreeItem[],id:string): LayerTreeItem | undefined {
        for(const item of items){if(item.id===id)return item;const child=this.findItem(item.children??[],id);if(child)return child;}return undefined;
    }
    private rowNodes(): HTMLElement[] { return [...(this.tree?.querySelectorAll<HTMLElement>('[role=treeitem]') ?? [])]; }
    private handleKey(event: KeyboardEvent): void {
        const rows = this.rowNodes();
        const current = event.composedPath().find(node => node instanceof HTMLElement && node.getAttribute('role') === 'treeitem') as HTMLElement | undefined;
        if (!current || event.composedPath().some(node => node !== current && node instanceof Element && (node.matches('button,input') || node.localName.startsWith('cb-'))))
            return;
        const index = rows.indexOf(current);
        const id = current.dataset.id ?? '';
        let target: HTMLElement | undefined;
        if (event.key === 'ArrowDown')
            target = rows[index + 1] ?? rows[0];
        else if (event.key === 'ArrowUp')
            target = rows[index - 1] ?? rows.at(-1);
        else if (event.key === 'Home')
            target = rows[0];
        else if (event.key === 'End')
            target = rows.at(-1);
        else if (event.key === 'ArrowRight') {
            if (current.getAttribute('aria-expanded') === 'false')
                this.toggleExpanded(id, event);
            else
                target = rows[index + 1];
        }
        else if (event.key === 'ArrowLeft') {
            if (current.getAttribute('aria-expanded') === 'true')
                this.toggleExpanded(id, event);
            else
                target = current.parentElement?.parentElement?.previousElementSibling as HTMLElement | undefined;
        }
        else if (event.key === 'Enter' || event.key === ' ')
            this.select(id, event.metaKey || event.ctrlKey, event);
        else if (event.key === 'F2' && bool(this.editable)) {
            const item=this.findItem(this.normalizedItems(),id); if(item)this.beginEdit(item);
        }
        else
            return;
        event.preventDefault();
        if (target) {
            rows.forEach(row => { row.tabIndex = row === target ? 0 : -1; });
            target.focus();
        }
    }
    private dragOver(row: HTMLElement, event: DragEvent): void {
        if (!this.draggingId || this.draggingId === row.dataset.id)
            return;
        event.preventDefault();
        const bounds = row.getBoundingClientRect();
        const ratio = (event.clientY - bounds.top) / Math.max(1, bounds.height);
        const position: LayerDropPosition = ratio < .25 ? 'before' : ratio > .75 ? 'after' : 'inside';
        row.dataset.drop = position;
        if (event.dataTransfer)
            event.dataTransfer.dropEffect = 'move';
    }
    private drop(targetId: string, row: HTMLElement, event: DragEvent): void {
        event.preventDefault();
        const position = (row.dataset.drop ?? 'inside') as LayerDropPosition;
        row.removeAttribute('data-drop');
        if (this.move(this.draggingId, targetId, position, event) && position === 'inside') {
            const expanded = new Set(this.expandedIds);
            expanded.add(targetId);
            this.expandedIds = [...expanded];
            this.syncView();
        }
        this.draggingId = '';
    }
}
export { LayerTreeBase };
export type { LayerTreeProps, LayerTreeItem, LayerDropPosition } from './LayerTreeBase.js';
