import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'

export interface LayerTreeItem {
    id: string
    label: string
    description?: string
    icon?: string
    children?: readonly LayerTreeItem[]
    hidden?: boolean
    locked?: boolean
    disabled?: boolean
    renamable?: boolean
    draggable?: boolean
}
export type LayerDropPosition = 'before' | 'after' | 'inside'
export interface LayerTreeProps extends ComponentProps {
    items?: readonly LayerTreeItem[]
    selectedIds?: readonly string[]
    expandedIds?: readonly string[]
    multiple?: boolean
    editable?: boolean
    reorderable?: boolean
    showVisibility?: boolean
    showLock?: boolean
    emptyLabel?: string
    expandLabel?: string
    collapseLabel?: string
    showLabel?: string
    hideLabel?: string
    lockLabel?: string
    unlockLabel?: string
    renameLabel?: string
    saveLabel?: string
    cancelLabel?: string
    moveLabel?: string
}

function normalizeTree(items: readonly LayerTreeItem[]): LayerTreeItem[] {
    const ids = new Set<string>()
    const ancestors = new WeakSet<object>()
    const visit = (nodes: readonly LayerTreeItem[]): LayerTreeItem[] => Array.isArray(nodes) ? nodes.flatMap(node => {
        if (!node || typeof node !== 'object' || ancestors.has(node)) return []
        const id = scalarText(node.id).trim()
        const label = scalarText(node.label)
        if (!id || !label || ids.has(id)) return []
        ids.add(id); ancestors.add(node)
        const normalized: LayerTreeItem = {
            id, label, description: scalarText(node.description), icon: scalarText(node.icon), hidden: bool(node.hidden), locked: bool(node.locked),
            disabled: bool(node.disabled), renamable: node.renamable !== false, draggable: node.draggable !== false,
            children: visit(node.children ?? []),
        }
        ancestors.delete(node)
        return [normalized]
    }) : []
    return visit(items)
}

function updateNode(items: readonly LayerTreeItem[], id: string, update: (item: LayerTreeItem) => LayerTreeItem): LayerTreeItem[] {
    return items.map(item => item.id === id ? update(item) : { ...item, children: updateNode(item.children ?? [], id, update) })
}

function contains(items: readonly LayerTreeItem[], parentId: string, childId: string): boolean {
    const parent = flatten(items).find(item => item.id === parentId)
    return Boolean(parent && flatten(parent.children ?? []).some(item => item.id === childId))
}

function flatten(items: readonly LayerTreeItem[]): LayerTreeItem[] { return items.flatMap(item => [item, ...flatten(item.children ?? [])]) }

function removeNode(items: readonly LayerTreeItem[], id: string): { items: LayerTreeItem[]; removed?: LayerTreeItem } {
    let removed: LayerTreeItem | undefined
    const next = items.flatMap(item => {
        if (item.id === id) { removed = item; return [] }
        const childResult = removeNode(item.children ?? [], id)
        if (childResult.removed) removed = childResult.removed
        return [{ ...item, children: childResult.items }]
    })
    return { items: next, removed }
}

function insertNode(items: readonly LayerTreeItem[], targetId: string, position: LayerDropPosition, node: LayerTreeItem): LayerTreeItem[] {
    if (position === 'inside') return updateNode(items, targetId, item => ({ ...item, children: [...(item.children ?? []), node] }))
    return items.flatMap(item => {
        if (item.id === targetId) return position === 'before' ? [node, item] : [item, node]
        return [{ ...item, children: insertNode(item.children ?? [], targetId, position, node) }]
    })
}

/** Accessible hierarchical selection, disclosure, editing and reorder behavior. */
export abstract class LayerTreeBase<P extends LayerTreeProps = LayerTreeProps> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes, 'items', 'selected-ids', 'expanded-ids', 'multiple', 'editable', 'reorderable',
        'show-visibility', 'show-lock', 'empty-label', 'expand-label', 'collapse-label', 'show-label', 'hide-label',
        'lock-label', 'unlock-label', 'rename-label', 'save-label', 'cancel-label', 'move-label',
    ]
    items: readonly LayerTreeItem[] = []
    selectedIds: readonly string[] = []
    expandedIds: readonly string[] = []
    multiple = true
    editable = true
    reorderable = true
    showVisibility = true
    showLock = true
    emptyLabel = ''
    expandLabel = ''
    collapseLabel = ''
    showLabel = ''
    hideLabel = ''
    lockLabel = ''
    unlockLabel = ''
    renameLabel = ''
    saveLabel = ''
    cancelLabel = ''
    moveLabel = ''

    normalizedItems(): readonly LayerTreeItem[] { return normalizeTree(this.items) }
    flattenedItems(): readonly LayerTreeItem[] { return flatten(this.normalizedItems()) }

    toggleExpanded(id: string, originalEvent?: Event): boolean {
        const item = this.flattenedItems().find(candidate => candidate.id === id)
        if (!item?.children?.length || item.disabled || this.unavailable) return false
        const expanded = new Set(this.expandedIds)
        const next = !expanded.has(id)
        if (next) expanded.add(id); else expanded.delete(id)
        const detail = { id, expanded: next, expandedIds: [...expanded], originalEvent }
        if (!this.request('cb-before-expansion-change', detail)) return false
        this.expandedIds = detail.expandedIds
        this.syncView()
        this.emit('cb-expansion-change', detail)
        return true
    }

    select(id: string, additive = false, originalEvent?: Event): boolean {
        const item = this.flattenedItems().find(candidate => candidate.id === id)
        if (!item || item.disabled || this.unavailable) return false
        const selected = new Set(this.selectedIds)
        if (!bool(this.multiple) || !additive) selected.clear()
        if (additive && selected.has(id)) selected.delete(id); else selected.add(id)
        const selectedIds = [...selected]
        const detail = { id, selectedIds, selectedItems: this.flattenedItems().filter(candidate => selected.has(candidate.id)), originalEvent }
        if (!this.request('cb-before-selection-change', detail)) return false
        this.selectedIds = selectedIds
        this.syncView()
        this.emit('cb-selection-change', detail)
        return true
    }

    rename(id: string, label: string, originalEvent?: Event): boolean {
        const nextLabel = scalarText(label).trim()
        const item = this.flattenedItems().find(candidate => candidate.id === id)
        if (!nextLabel || !item || item.disabled || item.renamable === false || !bool(this.editable) || this.unavailable) return false
        const items = updateNode(this.normalizedItems(), id, current => ({ ...current, label: nextLabel }))
        return this.commitItems(items, 'rename', { id, label: nextLabel, originalEvent })
    }

    toggleVisibility(id: string, originalEvent?: Event): boolean {
        const item = this.flattenedItems().find(candidate => candidate.id === id)
        if (!item || item.disabled || this.unavailable) return false
        const hidden = !bool(item.hidden)
        const items = updateNode(this.normalizedItems(), id, current => ({ ...current, hidden }))
        return this.commitItems(items, 'visibility', { id, hidden, originalEvent })
    }

    toggleLock(id: string, originalEvent?: Event): boolean {
        const item = this.flattenedItems().find(candidate => candidate.id === id)
        if (!item || item.disabled || this.unavailable) return false
        const locked = !bool(item.locked)
        const items = updateNode(this.normalizedItems(), id, current => ({ ...current, locked }))
        return this.commitItems(items, 'lock', { id, locked, originalEvent })
    }

    move(id: string, targetId: string, position: LayerDropPosition, originalEvent?: Event): boolean {
        const items = this.normalizedItems()
        if (!bool(this.reorderable) || this.unavailable || id === targetId || contains(items, id, targetId)) return false
        const source = this.flattenedItems().find(item => item.id === id)
        const target = this.flattenedItems().find(item => item.id === targetId)
        if (!source || !target || source.disabled || target.disabled || source.draggable === false) return false
        const removal = removeNode(items, id)
        if (!removal.removed) return false
        const moved = insertNode(removal.items, targetId, position, removal.removed)
        return this.commitItems(moved, 'reorder', { id, targetId, position, originalEvent })
    }

    protected itemLabel(template: string, item: LayerTreeItem): string { return scalarText(template).replaceAll('{item}', item.label) }

    private commitItems(items: readonly LayerTreeItem[], reason: string, detail: object): boolean {
        const change = { items, reason, ...detail }
        if (!this.request('cb-before-items-change', change)) return false
        this.items = items
        this.syncView()
        this.emit('cb-items-change', change)
        return true
    }
}
