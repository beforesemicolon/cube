import '../../form/text-input/index.js'
import type { TextInput } from '../../form/text-input/index.js'
import { actionLabel, createButton, createIconButton } from '../../action/create.js'
import type { IconButton } from '../../action/icon-button/index.js'
import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { createIcon, iconPaths } from '../../icons/paths.js'
import { bool, scalarText } from '../../core/value.js'
import { LayerTreeBase, type LayerDropPosition, type LayerTreeItem } from './LayerTreeBase.js'

const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0}[part~=tree],[part~=group]{display:grid;gap:1px;margin:0;padding:0;list-style:none}[part~=group]{padding-inline-start:var(--component-tree-indent,20px)}
[part~=row]{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;align-items:center;gap:var(--spacing-xs,4px);min-block-size:30px;padding:2px var(--spacing-xs,4px);border:1px solid transparent;border-radius:var(--radius-sm);background:transparent;color:inherit}
[part~=row]:hover{background:var(--color-active)}[part~=row][aria-selected=true]{background:var(--color-selection);border-color:var(--color-primary)}[part~=row][data-hidden] [part~=label]{opacity:.55;font-style:italic}[part~=row][data-locked] [part~=label]{color:var(--color-muted-foreground)}
[part~=disclosure],[part~=action]{--component-button-min-width:24px;--component-control-height-sm:24px}[part~=spacer]{inline-size:24px}[part~=type-icon]{inline-size:16px;block-size:16px;color:var(--color-muted-foreground)}
[part~=copy]{display:grid;min-inline-size:0;text-align:start}[part~=label]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}[part~=description]{color:var(--color-muted-foreground);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[part~=actions]{display:flex;align-items:center;gap:1px;opacity:0}[part~=row]:hover [part~=actions],[part~=row]:focus-within [part~=actions],[part~=row][aria-selected=true] [part~=actions]{opacity:1}
[part~=empty]{padding:var(--spacing-md,12px);color:var(--color-muted-foreground);text-align:center}[part~=edit-row]{display:flex;align-items:center;gap:var(--spacing-xs,4px);min-inline-size:0}[part~=edit-input]{display:block;min-inline-size:100px;flex:1}
[part~=row][data-drop=before]{box-shadow:inset 0 2px var(--color-primary)}[part~=row][data-drop=after]{box-shadow:inset 0 -2px var(--color-primary)}[part~=row][data-drop=inside]{background:var(--color-selection);outline:1px solid var(--color-primary)}
`

export class LayerTree extends LayerTreeBase {
    private tree?: HTMLElement
    private editingId = ''
    private draggingId = ''
    render(): Node {
        this.tree = el('div', 'tree')
        this.tree.setAttribute('role', 'tree')
        this.tree.addEventListener('keydown', event => this.handleKey(event))
        return fragment(sheet(css), this.tree)
    }
    protected syncView(): void {
        if (!this.tree) return
        this.tree.setAttribute('aria-label', this.accessibleName())
        aria(this.tree, 'aria-multiselectable', bool(this.multiple) ? true : null)
        const items = this.normalizedItems()
        this.tree.replaceChildren()
        if (!items.length) { const empty = el('div', 'empty', scalarText(this.emptyLabel)); empty.setAttribute('role', 'status'); this.tree.append(empty); return }
        this.tree.append(...this.renderItems(items, 1))
        const first = this.rowNodes()[0]
        if (first && !this.rowNodes().some(row => row.tabIndex === 0)) first.tabIndex = 0
    }

    private renderItems(items: readonly LayerTreeItem[], level: number): HTMLElement[] {
        const expanded = new Set(this.expandedIds)
        const selected = new Set(this.selectedIds)
        return items.map(item => {
            const container = el('div', 'item')
            const row = el('div', 'row')
            row.dataset.id = item.id
            row.tabIndex = selected.has(item.id) ? 0 : -1
            row.setAttribute('role', 'treeitem')
            row.setAttribute('aria-level', String(level))
            aria(row, 'aria-selected', selected.has(item.id))
            if (item.children?.length) aria(row, 'aria-expanded', expanded.has(item.id))
            row.toggleAttribute('data-hidden', bool(item.hidden)); row.toggleAttribute('data-locked', bool(item.locked))
            row.draggable = bool(this.reorderable) && item.draggable !== false && !item.disabled && !this.unavailable
            if (item.children?.length) {
                const disclosure = createIconButton('disclosure', expanded.has(item.id) ? 'down' : 'right', event => this.toggleExpanded(item.id, event))
                actionLabel(disclosure, this.itemLabel(expanded.has(item.id) ? this.collapseLabel : this.expandLabel, item)); disclosure.size = 'xs'; row.append(disclosure)
            } else row.append(el('span', 'spacer'))
            row.append(createIcon(item.icon && Object.hasOwn(iconPaths, item.icon) ? item.icon : item.children?.length ? 'layers' : 'component', 'type-icon icon'))
            if (this.editingId === item.id) row.append(this.editRow(item))
            else {
                const copy = el('span', 'copy')
                copy.append(el('span', 'label', item.label))
                if (item.description) copy.append(el('span', 'description', item.description))
                row.append(copy, this.actions(item))
            }
            row.addEventListener('click', event => {
                if (event.composedPath().some(node => node !== row && node instanceof Element && (node.matches('button,input') || node.localName.startsWith('cb-')))) return
                this.select(item.id, event.metaKey || event.ctrlKey, event)
            })
            row.addEventListener('dblclick', event => { if (bool(this.editable) && item.renamable !== false) { this.editingId = item.id; this.syncView(); event.preventDefault() } })
            row.addEventListener('dragstart', event => { this.draggingId = item.id; event.dataTransfer?.setData('text/plain', item.id); if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move' })
            row.addEventListener('dragover', event => this.dragOver(row, event))
            row.addEventListener('dragleave', () => row.removeAttribute('data-drop'))
            row.addEventListener('drop', event => this.drop(item.id, row, event))
            container.append(row)
            if (item.children?.length && expanded.has(item.id)) {
                const group = el('div', 'group'); group.setAttribute('role', 'group'); group.append(...this.renderItems(item.children, level + 1)); container.append(group)
            }
            return container
        })
    }

    private actions(item: LayerTreeItem): HTMLElement {
        const actions = el('span', 'actions')
        if (bool(this.showVisibility)) actions.append(this.itemAction('visibility', bool(item.hidden) ? 'eyeOff' : 'eye', this.itemLabel(bool(item.hidden) ? this.showLabel : this.hideLabel, item), event => this.toggleVisibility(item.id, event)))
        if (bool(this.showLock)) actions.append(this.itemAction('lock', bool(item.locked) ? 'lock' : 'unlock', this.itemLabel(bool(item.locked) ? this.unlockLabel : this.lockLabel, item), event => this.toggleLock(item.id, event)))
        if (bool(this.editable) && item.renamable !== false) actions.append(this.itemAction('rename', 'text', this.itemLabel(this.renameLabel, item), event => { this.editingId = item.id; this.syncView(); event.stopPropagation() }))
        return actions
    }

    private itemAction(part: string, icon: string, label: string, handler: (event: CustomEvent) => void): IconButton {
        const button = createIconButton(`action ${part}`, icon, handler); actionLabel(button, label); button.size = 'xs'; button.disabled = this.unavailable; return button
    }

    private editRow(item: LayerTreeItem): HTMLElement {
        const editor = el('span', 'edit-row')
        const input = document.createElement('cb-text-input') as TextInput
        input.setAttribute('part', 'edit-input')
        Object.assign(input, { value: item.label, label: '', accessibleLabel: this.itemLabel(this.renameLabel, item) })
        let draft = item.label
        input.addEventListener('input', event => {
            const control = event.composedPath().find(node => node instanceof HTMLInputElement)
            if (control instanceof HTMLInputElement) draft = control.value
        })
        input.addEventListener('cb-change', () => { draft = scalarText(input.value) })
        const commit = (event?: Event): void => {
            if (this.rename(item.id, draft, event)) this.editingId = ''
            this.syncView()
        }
        const dismiss = (): void => { this.editingId = ''; this.syncView() }
        const save = createButton('save', event => commit(event))
        const cancel = createButton('cancel', dismiss)
        actionLabel(save, scalarText(this.saveLabel)); actionLabel(cancel, scalarText(this.cancelLabel))
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') { event.preventDefault(); commit(event) }
            else if (event.key === 'Escape') { event.preventDefault(); dismiss() }
        })
        editor.append(input, save, cancel)
        queueMicrotask(() => input.focus())
        return editor
    }

    private rowNodes(): HTMLElement[] { return [...(this.tree?.querySelectorAll<HTMLElement>('[role=treeitem]') ?? [])] }
    private handleKey(event: KeyboardEvent): void {
        const rows = this.rowNodes(); const current = event.composedPath().find(node => node instanceof HTMLElement && node.getAttribute('role') === 'treeitem') as HTMLElement | undefined
        if (!current || event.composedPath().some(node => node !== current && node instanceof Element && (node.matches('button,input') || node.localName.startsWith('cb-')))) return
        const index = rows.indexOf(current); const id = current.dataset.id ?? ''
        let target: HTMLElement | undefined
        if (event.key === 'ArrowDown') target = rows[index + 1] ?? rows[0]
        else if (event.key === 'ArrowUp') target = rows[index - 1] ?? rows.at(-1)
        else if (event.key === 'Home') target = rows[0]
        else if (event.key === 'End') target = rows.at(-1)
        else if (event.key === 'ArrowRight') { if (current.getAttribute('aria-expanded') === 'false') this.toggleExpanded(id, event); else target = rows[index + 1] }
        else if (event.key === 'ArrowLeft') {
            if (current.getAttribute('aria-expanded') === 'true') this.toggleExpanded(id, event)
            else target = current.parentElement?.parentElement?.previousElementSibling as HTMLElement | undefined
        } else if (event.key === 'Enter' || event.key === ' ') this.select(id, event.metaKey || event.ctrlKey, event)
        else if (event.key === 'F2' && bool(this.editable)) { this.editingId = id; this.syncView() }
        else return
        event.preventDefault()
        if (target) { rows.forEach(row => { row.tabIndex = row === target ? 0 : -1 }); target.focus() }
    }

    private dragOver(row: HTMLElement, event: DragEvent): void {
        if (!this.draggingId || this.draggingId === row.dataset.id) return
        event.preventDefault()
        const bounds = row.getBoundingClientRect(); const ratio = (event.clientY - bounds.top) / Math.max(1, bounds.height)
        const position: LayerDropPosition = ratio < .25 ? 'before' : ratio > .75 ? 'after' : 'inside'
        row.dataset.drop = position
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    }
    private drop(targetId: string, row: HTMLElement, event: DragEvent): void {
        event.preventDefault()
        const position = (row.dataset.drop ?? 'inside') as LayerDropPosition
        row.removeAttribute('data-drop')
        if (this.move(this.draggingId, targetId, position, event) && position === 'inside') {
            const expanded = new Set(this.expandedIds); expanded.add(targetId); this.expandedIds = [...expanded]; this.syncView()
        }
        this.draggingId = ''
    }
}

register('cb-layer-tree', LayerTree)
export { LayerTreeBase }
export type { LayerTreeProps, LayerTreeItem, LayerDropPosition } from './LayerTreeBase.js'
