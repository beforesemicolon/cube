import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'

export type FileBrowserView = 'grid' | 'table'
export type FileBrowserSelectionMode =
    'none' | 'single' | 'multiple' | 'actions'
export type FileBrowserSort = 'name' | 'type' | 'size' | 'modified'
export type FileBrowserSortDirection = 'asc' | 'desc'
export type FileBrowserActionScope = 'entry' | 'selection'

export interface FileBrowserAction {
    id: string
    label: string
    icon?: string
    description?: string
    tone?: 'default' | 'danger'
    group?: string
    disabled?: boolean
    hidden?: boolean
    selection?: 'any' | 'single'
}

export interface FileBrowserEntry {
    id: string
    name: string
    type: 'file' | 'folder'
    parentId?: string
    path?: string
    size?: number
    modified?: string
    mime?: string
    thumbnail?: string
    description?: string
    metadata?: readonly string[]
    icon?: string
    selectable?: boolean
    disabled?: boolean
    actions?: readonly FileBrowserAction[]
    data?: object
}

export interface FileBrowserPathItem {
    id: string
    label: string
}

export interface FileBrowserActionDetail {
    action: FileBrowserAction
    scope: FileBrowserActionScope
    entry?: FileBrowserEntry
    selectedIds: readonly string[]
    selectedEntries: readonly FileBrowserEntry[]
    originalEvent?: Event
}

export interface FileBrowserProps extends ComponentProps {
    entries?: readonly FileBrowserEntry[]
    pathItems?: readonly FileBrowserPathItem[]
    actions?: readonly FileBrowserAction[]
    currentFolderId?: string
    query?: string
    view?: FileBrowserView
    sortBy?: FileBrowserSort
    sortDirection?: FileBrowserSortDirection
    selectionMode?: FileBrowserSelectionMode
    selectedIds?: readonly string[]
    /** Zero means unlimited; single selection always allows at most one entry. */
    maxSelections?: number
    selectionCountLabel?: string
    selectionLimitLabel?: string
    selectedFilesLabel?: string
    clearSelectionLabel?: string
    removeSelectionLabel?: string
    searchable?: boolean
    loading?: boolean
    toolbarEnabled?: boolean
    createFolderEnabled?: boolean
    createFolderLabel?: string
    createFolderDisabled?: boolean
    uploadEnabled?: boolean
    uploadLabel?: string
    uploading?: boolean
    uploadDisabled?: boolean
    refreshEnabled?: boolean
    refreshLabel?: string
    refreshing?: boolean
    refreshDisabled?: boolean
    actionMenuLabel?: string
    selectionActionsLabel?: string
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
    emptyIcon?: string
    emptyLabel?: string
    noMatchLabel?: string
    loadingLabel?: string
    openEntryLabel?: string
    selectEntryLabel?: string
    deselectEntryLabel?: string
    sortAscendingLabel?: string
    sortDescendingLabel?: string
}

const normalizeAction = (
    action: FileBrowserAction
): FileBrowserAction | null => {
    const id = scalarText(action.id).trim()
    const label = scalarText(action.label).trim()
    if (!id || !label) return null

    return {
        id,
        label,
        icon: scalarText(action.icon),
        description: scalarText(action.description),
        tone: action.tone === 'danger' ? 'danger' : 'default',
        group: scalarText(action.group),
        disabled: bool(action.disabled),
        hidden: bool(action.hidden),
        selection: action.selection === 'single' ? 'single' : 'any',
    }
}

const normalizeActions = (
    actions: readonly FileBrowserAction[] | undefined
): FileBrowserAction[] =>
    Array.isArray(actions)
        ? actions.flatMap((action) => {
              const normalized = normalizeAction(action)
              return normalized ? [normalized] : []
          })
        : []

const normalizeEntries = (
    entries: readonly FileBrowserEntry[]
): FileBrowserEntry[] => {
    const ids = new Set<string>()
    return Array.isArray(entries)
        ? entries.flatMap((entry) => {
              if (!entry || typeof entry !== 'object') return []
              const id = scalarText(entry.id).trim()
              const name = scalarText(entry.name).trim()
              if (!id || !name || ids.has(id)) return []
              ids.add(id)
              return [
                  {
                      id,
                      name,
                      type:
                          entry.type === 'folder'
                              ? ('folder' as const)
                              : ('file' as const),
                      parentId: scalarText(entry.parentId),
                      path: scalarText(entry.path) || id,
                      size:
                          typeof entry.size === 'number' &&
                          Number.isFinite(entry.size)
                              ? Math.max(0, entry.size)
                              : undefined,
                      modified: scalarText(entry.modified),
                      mime: scalarText(entry.mime),
                      thumbnail: scalarText(entry.thumbnail),
                      description: scalarText(entry.description),
                      metadata: Array.isArray(entry.metadata)
                          ? entry.metadata
                                .map((item: string) => scalarText(item).trim())
                                .filter(Boolean)
                          : [],
                      icon: scalarText(entry.icon),
                      selectable:
                          typeof entry.selectable === 'boolean'
                              ? entry.selectable
                              : entry.type === 'file',
                      disabled: bool(entry.disabled),
                      actions: normalizeActions(entry.actions),
                      data: entry.data,
                  },
              ]
          })
        : []
}

/** Navigation, filtering, sorting, selection, and action behavior for files and folders. */
export abstract class FileBrowserBase<
    P extends FileBrowserProps = FileBrowserProps,
> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'entries',
        'path-items',
        'actions',
        'current-folder-id',
        'query',
        'view',
        'sort-by',
        'sort-direction',
        'selection-mode',
        'selected-ids',
        'searchable',
        'loading',
        'toolbar-enabled',
        'create-folder-enabled',
        'create-folder-label',
        'create-folder-disabled',
        'upload-enabled',
        'upload-label',
        'uploading',
        'upload-disabled',
        'refresh-enabled',
        'refresh-label',
        'refreshing',
        'refresh-disabled',
        'action-menu-label',
        'selection-actions-label',
        'search-label',
        'search-placeholder',
        'grid-view-label',
        'table-view-label',
        'breadcrumb-label',
        'expand-path-label',
        'root-label',
        'name-label',
        'type-label',
        'size-label',
        'modified-label',
        'empty-icon',
        'empty-label',
        'no-match-label',
        'loading-label',
        'open-entry-label',
        'select-entry-label',
        'deselect-entry-label',
        'sort-ascending-label',
        'sort-descending-label',
        'max-selections',
        'selection-count-label',
        'selection-limit-label',
        'selected-files-label',
        'clear-selection-label',
        'remove-selection-label',
    ]

    entries: readonly FileBrowserEntry[] = []
    pathItems: readonly FileBrowserPathItem[] = []
    actions: readonly FileBrowserAction[] = []
    currentFolderId = ''
    query = ''
    view: FileBrowserView = 'grid'
    sortBy: FileBrowserSort = 'name'
    sortDirection: FileBrowserSortDirection = 'asc'
    selectionMode: FileBrowserSelectionMode = 'single'
    selectedIds: readonly string[] = []
    maxSelections = 0
    selectionCountLabel = ''
    selectionLimitLabel = ''
    selectedFilesLabel = ''
    clearSelectionLabel = ''
    removeSelectionLabel = ''
    searchable = true
    loading = false
    toolbarEnabled = true
    createFolderEnabled = false
    createFolderLabel = ''
    createFolderDisabled = false
    uploadEnabled = false
    uploadLabel = ''
    uploading = false
    uploadDisabled = false
    refreshEnabled = false
    refreshLabel = ''
    refreshing = false
    refreshDisabled = false
    actionMenuLabel = ''
    selectionActionsLabel = ''
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
    emptyIcon = 'folder'
    emptyLabel = ''
    noMatchLabel = ''
    loadingLabel = ''
    openEntryLabel = ''
    selectEntryLabel = ''
    deselectEntryLabel = ''
    sortAscendingLabel = ''
    sortDescendingLabel = ''

    private entriesInput: readonly FileBrowserEntry[] | null = null
    private entriesCache: readonly FileBrowserEntry[] = []
    private selectionInput: readonly string[] | null = null
    private selectionEntriesInput: readonly FileBrowserEntry[] | null = null
    private selectionCache: readonly FileBrowserEntry[] = []

    normalizedEntries(): readonly FileBrowserEntry[] {
        if (this.entriesInput !== this.entries) {
            this.entriesInput = this.entries
            this.entriesCache = normalizeEntries(this.entries)
        }
        return this.entriesCache
    }

    selectedEntries = (): readonly FileBrowserEntry[] => {
        const normalized = this.normalizedEntries()
        if (
            this.selectionInput !== this.selectedIds ||
            this.selectionEntriesInput !== normalized
        ) {
            const entries = new Map(
                normalized.map((entry) => [entry.id, entry])
            )
            this.selectionInput = this.selectedIds
            this.selectionEntriesInput = normalized
            this.selectionCache = [...new Set(this.selectedIds)].flatMap(
                (id) => {
                    const entry = entries.get(id)
                    return entry ? [entry] : []
                }
            )
        }
        return this.selectionCache
    }

    get selectionCount(): number {
        return this.selectedEntries().length
    }

    get selectionLimit(): number {
        if (this.selectionMode === 'single') return 1
        const limit = Number(this.maxSelections)
        return Number.isFinite(limit) && limit > 0
            ? Math.max(1, Math.floor(limit))
            : 0
    }

    protected selectionSummary = (): string =>
        scalarText(
            this.selectionLimit
                ? this.selectionLimitLabel || this.selectionCountLabel
                : this.selectionCountLabel
        )
            .replaceAll('{count}', String(this.selectionCount))
            .replaceAll('{max}', String(this.selectionLimit))

    protected entrySelectable = (entry: FileBrowserEntry): boolean =>
        this.selectionMode !== 'none' &&
        entry.selectable !== false &&
        !entry.disabled

    protected entryDisabled = (entry: FileBrowserEntry): boolean =>
        this.unavailable ||
        !!entry.disabled ||
        (this.selectionMode !== 'single' &&
            this.selectionMode !== 'none' &&
            this.selectionLimit > 0 &&
            this.selectionCount >= this.selectionLimit &&
            !this.selectedIds.includes(entry.id))

    protected visibleSelection = (
        ids: readonly string[]
    ): readonly string[] => {
        if (
            this.selectionMode !== 'multiple' &&
            this.selectionMode !== 'actions'
        )
            return ids
        const visible = new Set(this.visibleEntries().map((entry) => entry.id))
        return [...this.selectedIds.filter((id) => !visible.has(id)), ...ids]
    }

    protected validSelection = (ids: readonly string[]): boolean =>
        !this.selectionLimit ||
        this.allowedSelection(ids).length <= this.selectionLimit

    private allowedSelection(ids: readonly string[]): FileBrowserEntry[] {
        const entries = new Map(
            this.normalizedEntries().map((entry) => [entry.id, entry])
        )
        return [...new Set(ids)].flatMap((id) => {
            const entry = entries.get(id)
            return entry &&
                (this.entrySelectable(entry) || this.selectedIds.includes(id))
                ? [entry]
                : []
        })
    }

    visibleEntries = (): readonly FileBrowserEntry[] => {
        const query = scalarText(this.query).trim().toLocaleLowerCase()
        const normalized = this.normalizedEntries()
        const hierarchical = normalized.some((entry) =>
            scalarText(entry.parentId)
        )
        const entries = (
            hierarchical
                ? normalized.filter(
                      (entry) =>
                          scalarText(entry.parentId) ===
                          scalarText(this.currentFolderId)
                  )
                : normalized
        ).filter(
            (entry) =>
                !query ||
                `${entry.name} ${entry.description ?? ''} ${entry.mime ?? ''} ${(entry.metadata ?? []).join(' ')}`
                    .toLocaleLowerCase()
                    .includes(query)
        )
        const direction = this.sortDirection === 'desc' ? -1 : 1
        const sort = this.sortBy
        return [...entries].sort((left, right) => {
            if (left.type !== right.type) return left.type === 'folder' ? -1 : 1
            if (sort === 'size')
                return direction * ((left.size ?? -1) - (right.size ?? -1))
            return (
                direction *
                scalarText(left[sort]).localeCompare(
                    scalarText(right[sort]),
                    this.documentLanguage(),
                    {
                        numeric: true,
                        sensitivity: 'base',
                    }
                )
            )
        })
    }

    resolvedPathItems(): readonly FileBrowserPathItem[] {
        if (this.pathItems.length) return this.pathItems

        const byId = new Map(
            this.normalizedEntries()
                .filter((entry) => entry.type === 'folder')
                .map((entry) => [entry.id, entry])
        )
        const result: FileBrowserPathItem[] = [
            { id: '', label: scalarText(this.rootLabel) },
        ]
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
        if (!this.request('beforefilterchange', detail)) return false
        this.query = next
        this.syncView()
        this.emit('filterchange', detail)
        return true
    }

    setView(view: FileBrowserView, originalEvent?: Event): boolean {
        if (
            this.unavailable ||
            view === this.view ||
            !['grid', 'table'].includes(view)
        )
            return false
        const detail = { view, originalEvent }
        if (!this.request('beforeviewchange', detail)) return false
        this.view = view
        this.syncView()
        this.emit('viewchange', detail)
        return true
    }

    navigate(folderId: string, originalEvent?: Event): boolean {
        const id = scalarText(folderId)
        const entry = this.normalizedEntries().find(
            (candidate) => candidate.id === id
        )
        const pathTarget = this.resolvedPathItems().some(
            (item) => item.id === id
        )
        if (
            this.unavailable ||
            (id &&
                !pathTarget &&
                (!entry || entry.type !== 'folder' || entry.disabled))
        )
            return false
        const detail = { folderId: id, entry, originalEvent }
        if (!this.request('beforenavigate', detail)) return false
        this.currentFolderId = id
        this.query = ''
        this.syncView()
        this.emit('navigate', detail)
        return true
    }

    select(entry: FileBrowserEntry, originalEvent?: Event): boolean {
        if (!this.entrySelectable(entry) || this.entryDisabled(entry))
            return false
        const current = new Set(
            Array.isArray(this.selectedIds) ? this.selectedIds.map(String) : []
        )
        if (this.selectionMode === 'single') {
            if (current.has(entry.id)) current.clear()
            else {
                current.clear()
                current.add(entry.id)
            }
        } else if (current.has(entry.id)) current.delete(entry.id)
        else current.add(entry.id)
        return this.setSelection([...current], originalEvent)
    }

    setSelection(ids: readonly string[], originalEvent?: Event): boolean {
        if (this.unavailable || this.selectionMode === 'none') return false
        const allowed = this.allowedSelection(
            Array.isArray(ids) ? ids.map(String) : []
        )
        const selectedEntries =
            this.selectionMode === 'single' ? allowed.slice(0, 1) : allowed
        if (
            (this.selectionMode === 'multiple' ||
                this.selectionMode === 'actions') &&
            !this.validSelection(ids)
        )
            return false
        const selectedIds = selectedEntries.map((entry) => entry.id)
        const detail = { selectedIds, selectedEntries, originalEvent }
        if (!this.request('beforeselectionchange', detail)) return false
        this.selectedIds = selectedIds
        this.syncView()
        this.emit('selectionchange', detail)
        return true
    }

    activate(entry: FileBrowserEntry, originalEvent?: Event): boolean {
        if (this.unavailable || entry.disabled) return false
        if (entry.type === 'folder')
            return this.navigate(entry.id, originalEvent)
        const detail = { entry, originalEvent }
        if (!this.request('beforeentryopen', detail)) return false
        this.emit('entryopen', detail)
        return true
    }

    changeSort(
        sortBy: FileBrowserSort,
        sortDirection: FileBrowserSortDirection,
        originalEvent?: Event
    ): boolean {
        if (this.unavailable) return false
        const detail = { sortBy, sortDirection, originalEvent }
        if (!this.request('beforesortchange', detail)) return false
        this.sortBy = sortBy
        this.sortDirection = sortDirection
        this.syncView()
        this.emit('sortchange', detail)
        return true
    }

    requestCreateFolder(originalEvent?: Event): boolean {
        if (
            this.unavailable ||
            !this.createFolderEnabled ||
            this.createFolderDisabled
        )
            return false
        this.emit('createfolderrequest', {
            folderId: scalarText(this.currentFolderId),
            originalEvent,
        })
        return true
    }

    requestUpload(originalEvent?: Event): boolean {
        if (
            this.unavailable ||
            !this.uploadEnabled ||
            this.uploadDisabled ||
            bool(this.uploading)
        )
            return false
        this.emit('uploadrequest', {
            folderId: scalarText(this.currentFolderId),
            originalEvent,
        })
        return true
    }

    requestRefresh(originalEvent?: Event): boolean {
        if (
            this.unavailable ||
            !this.refreshEnabled ||
            this.refreshDisabled ||
            bool(this.refreshing)
        )
            return false
        this.emit('refreshrequest', {
            folderId: scalarText(this.currentFolderId),
            originalEvent,
        })
        return true
    }

    entryActions(entry: FileBrowserEntry): readonly FileBrowserAction[] {
        return normalizeActions(entry.actions).filter(
            (action) => !action.hidden
        )
    }

    selectionActions = (): readonly FileBrowserAction[] => {
        const selected = this.selectedEntries()
        return normalizeActions(this.actions)
            .filter((action) => !action.hidden)
            .map((action) => ({
                ...action,
                disabled:
                    action.disabled ||
                    !selected.length ||
                    (action.selection === 'single' && selected.length !== 1) ||
                    selected.some((entry) =>
                        this.entryActions(entry).every(
                            (candidate) => candidate.id !== action.id
                        )
                    ),
            }))
    }

    triggerAction(
        action: FileBrowserAction,
        entry?: FileBrowserEntry,
        originalEvent?: Event
    ): boolean {
        const available = entry
            ? this.entryActions(entry)
            : this.selectionActions()
        const resolved = available.find(
            (candidate) => candidate.id === action.id
        )
        if (!resolved || resolved.disabled) return false
        const selectedEntries = entry ? [entry] : this.selectedEntries()
        const detail: FileBrowserActionDetail = {
            action: resolved,
            scope: entry ? 'entry' : 'selection',
            entry,
            selectedIds: selectedEntries.map((candidate) => candidate.id),
            selectedEntries,
            originalEvent,
        }
        this.emit('action', detail)
        return true
    }
}
