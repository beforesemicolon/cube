import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool, scalarText } from '../../core/value.js'

export type FileBrowserView = 'grid' | 'table'
export type FileBrowserSelectionMode = 'none' | 'single' | 'multiple'
export type FileBrowserSort = 'name' | 'type' | 'size' | 'modified'
export type FileBrowserSortDirection = 'asc' | 'desc'
export interface FileBrowserEntry {
    id: string
    name: string
    type: 'file' | 'folder'
    parentId?: string
    size?: number
    modified?: string
    mime?: string
    thumbnail?: string
    description?: string
    disabled?: boolean
}
export interface FileBrowserPathItem { id: string; label: string }
export interface FileBrowserProps extends UIProps {
    entries?: readonly FileBrowserEntry[]
    currentFolderId?: string
    query?: string
    view?: FileBrowserView
    sortBy?: FileBrowserSort
    sortDirection?: FileBrowserSortDirection
    selectionMode?: FileBrowserSelectionMode
    selectedIds?: readonly string[]
    searchable?: boolean
    loading?: boolean
    searchLabel?: string
    searchPlaceholder?: string
    gridViewLabel?: string
    tableViewLabel?: string
    breadcrumbLabel?: string
    expandPathLabel?: string
    rootLabel?: string
    nameLabel?: string
    typeLabel?: string
    sizeLabel?: string
    modifiedLabel?: string
    emptyLabel?: string
    noMatchLabel?: string
    loadingLabel?: string
    openEntryLabel?: string
    selectEntryLabel?: string
    deselectEntryLabel?: string
    sortAscendingLabel?: string
    sortDescendingLabel?: string
}

function normalizeEntries(entries: readonly FileBrowserEntry[]): FileBrowserEntry[] {
    const ids = new Set<string>()
    return Array.isArray(entries) ? entries.flatMap(entry => {
        if (!entry || typeof entry !== 'object') return []
        const id = scalarText(entry.id).trim()
        const name = scalarText(entry.name).trim()
        if (!id || !name || ids.has(id)) return []
        ids.add(id)
        return [{
            id, name, type: entry.type === 'folder' ? 'folder' as const : 'file' as const,
            parentId: scalarText(entry.parentId), size: typeof entry.size === 'number' && Number.isFinite(entry.size) ? Math.max(0, entry.size) : undefined,
            modified: scalarText(entry.modified), mime: scalarText(entry.mime), thumbnail: scalarText(entry.thumbnail),
            description: scalarText(entry.description), disabled: bool(entry.disabled),
        }]
    }) : []
}

/** Navigation, filtering, sorting and selection behavior for files and folders. */
export abstract class FileBrowserBase<P extends FileBrowserProps = FileBrowserProps> extends UIComponent<P> {
    static observedAttributes = [
        ...UIComponent.observedAttributes, 'entries', 'current-folder-id', 'query', 'view', 'sort-by', 'sort-direction',
        'selection-mode', 'selected-ids', 'searchable', 'loading', 'search-label', 'search-placeholder', 'grid-view-label',
        'table-view-label', 'breadcrumb-label', 'expand-path-label', 'root-label', 'name-label', 'type-label', 'size-label',
        'modified-label', 'empty-label', 'no-match-label', 'loading-label', 'open-entry-label', 'select-entry-label', 'deselect-entry-label',
        'sort-ascending-label', 'sort-descending-label',
    ]
    entries: readonly FileBrowserEntry[] = []
    currentFolderId = ''
    query = ''
    view: FileBrowserView = 'grid'
    sortBy: FileBrowserSort = 'name'
    sortDirection: FileBrowserSortDirection = 'asc'
    selectionMode: FileBrowserSelectionMode = 'single'
    selectedIds: readonly string[] = []
    searchable = true
    loading = false
    searchLabel = ''
    searchPlaceholder = ''
    gridViewLabel = ''
    tableViewLabel = ''
    breadcrumbLabel = ''
    expandPathLabel = ''
    rootLabel = ''
    nameLabel = ''
    typeLabel = ''
    sizeLabel = ''
    modifiedLabel = ''
    emptyLabel = ''
    noMatchLabel = ''
    loadingLabel = ''
    openEntryLabel = ''
    selectEntryLabel = ''
    deselectEntryLabel = ''
    sortAscendingLabel = ''
    sortDescendingLabel = ''

    normalizedEntries(): readonly FileBrowserEntry[] { return normalizeEntries(this.entries) }
    visibleEntries(): readonly FileBrowserEntry[] {
        const query = scalarText(this.query).trim().toLocaleLowerCase()
        const entries = this.normalizedEntries().filter(entry => scalarText(entry.parentId) === scalarText(this.currentFolderId))
            .filter(entry => !query || `${entry.name} ${entry.description ?? ''} ${entry.mime ?? ''}`.toLocaleLowerCase().includes(query))
        const direction = this.sortDirection === 'desc' ? -1 : 1
        const sort = this.sortBy
        return [...entries].sort((left, right) => {
            if (left.type !== right.type) return left.type === 'folder' ? -1 : 1
            if (sort === 'size') return direction * ((left.size ?? -1) - (right.size ?? -1))
            return direction * scalarText(left[sort]).localeCompare(scalarText(right[sort]), this.documentLanguage(), { numeric: true, sensitivity: 'base' })
        })
    }

    pathItems(): readonly FileBrowserPathItem[] {
        const byId = new Map(this.normalizedEntries().filter(entry => entry.type === 'folder').map(entry => [entry.id, entry]))
        const result: FileBrowserPathItem[] = [{ id: '', label: scalarText(this.rootLabel) }]
        const chain: FileBrowserPathItem[] = []
        const visited = new Set<string>()
        let id = scalarText(this.currentFolderId)
        while (id && !visited.has(id)) {
            visited.add(id)
            const entry = byId.get(id)
            if (!entry) break
            chain.unshift({ id: entry.id, label: entry.name })
            id = scalarText(entry.parentId)
        }
        return [...result, ...chain]
    }

    setQuery(query: string, originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const next = scalarText(query)
        if (next === this.query) return true
        const detail = { query: next, originalEvent }
        if (!this.request('cb-before-filter-change', detail)) return false
        this.query = next
        this.syncView()
        this.emit('cb-filter-change', detail)
        return true
    }

    setView(view: FileBrowserView, originalEvent?: Event): boolean {
        if (this.unavailable || view === this.view || !['grid', 'table'].includes(view)) return false
        const detail = { view, originalEvent }
        if (!this.request('cb-before-view-change', detail)) return false
        this.view = view
        this.syncView()
        this.emit('cb-view-change', detail)
        return true
    }

    navigate(folderId: string, originalEvent?: Event): boolean {
        const id = scalarText(folderId)
        if (this.unavailable || id && !this.normalizedEntries().some(entry => entry.id === id && entry.type === 'folder' && !entry.disabled)) return false
        const detail = { folderId: id, originalEvent }
        if (!this.request('cb-before-navigate', detail)) return false
        this.currentFolderId = id
        this.query = ''
        this.syncView()
        this.emit('cb-navigate', detail)
        return true
    }

    select(entry: FileBrowserEntry, originalEvent?: Event): boolean {
        if (this.unavailable || entry.disabled || this.selectionMode === 'none') return false
        const current = new Set(Array.isArray(this.selectedIds) ? this.selectedIds.map(String) : [])
        if (this.selectionMode === 'single') {
            if (current.has(entry.id)) current.clear()
            else { current.clear(); current.add(entry.id) }
        } else if (current.has(entry.id)) current.delete(entry.id)
        else current.add(entry.id)
        return this.setSelection([...current], originalEvent)
    }

    setSelection(ids: readonly string[], originalEvent?: Event): boolean {
        if (this.unavailable || this.selectionMode === 'none') return false
        const candidates = new Set(Array.isArray(ids) ? ids.map(String) : [])
        const allowed = this.normalizedEntries().filter(entry => !entry.disabled && candidates.has(entry.id))
        const selectedEntries = this.selectionMode === 'single' ? allowed.slice(0, 1) : allowed
        const selectedIds = selectedEntries.map(entry => entry.id)
        const detail = { selectedIds, selectedEntries, originalEvent }
        if (!this.request('cb-before-selection-change', detail)) return false
        this.selectedIds = selectedIds
        this.syncView()
        this.emit('cb-selection-change', detail)
        return true
    }

    activate(entry: FileBrowserEntry, originalEvent?: Event): boolean {
        if (this.unavailable || entry.disabled) return false
        if (entry.type === 'folder') return this.navigate(entry.id, originalEvent)
        const detail = { entry, originalEvent }
        if (!this.request('cb-before-entry-open', detail)) return false
        this.emit('cb-entry-open', detail)
        return true
    }

    changeSort(sortBy: FileBrowserSort, sortDirection: FileBrowserSortDirection, originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const detail = { sortBy, sortDirection, originalEvent }
        if (!this.request('cb-before-sort-change', detail)) return false
        this.sortBy = sortBy
        this.sortDirection = sortDirection
        this.syncView()
        this.emit('cb-sort-change', detail)
        return true
    }
}
