import { Component, type ComponentProps } from '../../core/Component.js'
import type { Template } from '../../core/runtime.js'
import { bool, scalarText } from '../../core/value.js'

export type TablePrimitive = string | number | boolean | null | undefined
export type TableValue = TablePrimitive | TableRecord | readonly TableValue[]
export interface TableRecord { readonly [key: string]: TableValue }
export type TableSelectionMode = 'none' | 'single' | 'multiple'
export type TableSortDirection = 'asc' | 'desc'
export type TableDensity = 'comfortable' | 'compact'
export type TableAlign = 'start' | 'center' | 'end'
export type TableCellVariant = 'success' | 'warning' | 'danger' | 'muted' | ''
export type TableCellContent = Template | Node | string | number | boolean | null | undefined

export interface TableCellContext<TItem extends object = TableRecord> {
    readonly item: TItem
    readonly rowIndex: number
    readonly column: TableColumn<TItem>
    readonly value: TableValue
    readonly depth: number
}

export interface TableColumn<TItem extends object = TableRecord> {
    readonly id: string
    readonly header: string
    readonly ariaLabel?: string
    readonly field?: string
    readonly cell?: (context: TableCellContext<TItem>) => TableCellContent
    readonly cellVariant?: TableCellVariant | ((context: TableCellContext<TItem>) => TableCellVariant)
    readonly align?: TableAlign
    readonly width?: string | number
    readonly minWidth?: string | number
    readonly maxWidth?: string | number
    readonly sortable?: boolean
    readonly sortKey?: string
    readonly compare?: (left: TItem, right: TItem) => number
    readonly group?: string
    readonly hidden?: boolean
    readonly wrap?: boolean
}

export interface TableRowModel {
    readonly item: TableRecord
    readonly key: string
    readonly depth: number
    readonly parentKey: string
    readonly hasChildren: boolean
}

export interface TableGroupModel {
    readonly key: string
    readonly label: string
    readonly rows: readonly TableRowModel[]
}

export interface TableProps<TItem extends object = TableRecord> extends ComponentProps {
    items?: readonly TItem[]
    columns?: readonly TableColumn<TItem>[]
    loading?: boolean
    loadingRows?: number
    selectionMode?: TableSelectionMode
    selectedKeys?: readonly string[]
    activeKey?: string
    itemKey?: string
    selectableField?: string
    sortBy?: string
    sortDirection?: TableSortDirection
    rowActivation?: boolean
    groupBy?: string
    groupLabelBy?: string
    parentBy?: string
    childrenBy?: string
    expandedKeys?: readonly string[]
    collapsedGroupKeys?: readonly string[]
    resizable?: boolean
    stickyHeader?: boolean
    stickyColumns?: number
    striped?: boolean
    wrap?: boolean
    density?: TableDensity
    emptyLabel?: string
    loadingLabel?: string
    selectAllLabel?: string
    deselectAllLabel?: string
    selectRowLabel?: string
    deselectRowLabel?: string
    expandRowLabel?: string
    collapseRowLabel?: string
    expandGroupLabel?: string
    collapseGroupLabel?: string
    sortAscendingLabel?: string
    sortDescendingLabel?: string
    ascendingLabel?: string
    descendingLabel?: string
    expandedLabel?: string
    collapsedLabel?: string
    resizeColumnLabel?: string
    selectionAnnouncement?: string
    sortAnnouncement?: string
    expansionAnnouncement?: string
}

interface TreeNode {
    readonly item: TableRecord
    readonly key: string
    readonly children: readonly TreeNode[]
}

function dataRecord(value: TableValue): TableRecord | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as TableRecord : null
}

function pathValue(item: TableRecord, path: string): TableValue {
    if (!path.trim()) return undefined
    let current: TableValue = item
    for (const segment of path.split('.').filter(Boolean)) {
        const record = dataRecord(current)
        if (!record) return undefined
        current = record[segment]
    }
    return current
}

function valueText(value: TableValue): string {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : ''
}

function defaultCompare(left: TableValue, right: TableValue): number {
    if (left == null && right == null) return 0
    if (left == null) return 1
    if (right == null) return -1
    if (typeof left === 'number' && typeof right === 'number') return left - right
    if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right)
    return valueText(left).localeCompare(valueText(right), undefined, { numeric: true, sensitivity: 'base' })
}

function template(text: string, values: Readonly<Record<string, string | number>>): string {
    return Object.entries(values).reduce((result, [name, value]) => result.replaceAll(`{${name}}`, String(value)), text)
}

/** Renderer-independent table behavior: sorting, selection, grouping and tree expansion. */
export abstract class TableBase extends Component<TableProps> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'items', 'columns', 'loading', 'loading-rows', 'selection-mode', 'selected-keys', 'active-key', 'item-key',
        'selectable-field', 'sort-by', 'sort-direction', 'row-activation', 'group-by', 'group-label-by', 'parent-by',
        'children-by', 'expanded-keys', 'collapsed-group-keys', 'resizable', 'sticky-header', 'sticky-columns', 'striped',
        'wrap', 'density', 'empty-label', 'loading-label', 'select-all-label', 'deselect-all-label', 'select-row-label',
        'deselect-row-label', 'expand-row-label', 'collapse-row-label', 'expand-group-label', 'collapse-group-label',
        'sort-ascending-label', 'sort-descending-label', 'resize-column-label', 'selection-announcement',
        'sort-announcement', 'expansion-announcement', 'ascending-label', 'descending-label', 'expanded-label', 'collapsed-label',
    ]

    items: readonly TableRecord[] = []
    columns: readonly TableColumn[] = []
    loading = false
    loadingRows = 5
    selectionMode: TableSelectionMode = 'none'
    selectedKeys: readonly string[] = []
    activeKey = ''
    itemKey = 'id'
    selectableField = ''
    sortBy = ''
    sortDirection: TableSortDirection = 'asc'
    rowActivation = false
    groupBy = ''
    groupLabelBy = ''
    parentBy = ''
    childrenBy = ''
    expandedKeys: readonly string[] = []
    collapsedGroupKeys: readonly string[] = []
    resizable = true
    stickyHeader = false
    stickyColumns = 0
    striped = false
    wrap = false
    density: TableDensity = 'comfortable'
    emptyLabel = ''
    loadingLabel = ''
    selectAllLabel = ''
    deselectAllLabel = ''
    selectRowLabel = ''
    deselectRowLabel = ''
    expandRowLabel = ''
    collapseRowLabel = ''
    expandGroupLabel = ''
    collapseGroupLabel = ''
    sortAscendingLabel = ''
    sortDescendingLabel = ''
    ascendingLabel = ''
    descendingLabel = ''
    expandedLabel = ''
    collapsedLabel = ''
    resizeColumnLabel = ''
    selectionAnnouncement = ''
    sortAnnouncement = ''
    expansionAnnouncement = ''

    protected announcement = ''

    protected itemList(): readonly TableRecord[] {
        return Array.isArray(this.items) ? this.items.filter(item => dataRecord(item) !== null) : []
    }

    protected columnList = (): readonly TableColumn[] => {
        if (!Array.isArray(this.columns)) return []
        const seen = new Set<string>()
        return this.columns.filter(column => {
            if (!column || typeof column !== 'object' || Array.isArray(column)) return false
            const id = scalarText(column.id).trim()
            if (!id || seen.has(id) || bool(column.hidden)) return false
            seen.add(id)
            return true
        })
    }

    protected read(item: TableRecord, path: string): TableValue { return pathValue(item, path) }

    protected keyFor(item: TableRecord, index: number): string {
        return valueText(pathValue(item, scalarText(this.itemKey))) || String(index)
    }

    protected isSelectable(item: TableRecord): boolean {
        const field = scalarText(this.selectableField).trim()
        return !field || bool(pathValue(item, field), true)
    }

    protected selectedKeySet(): Set<string> {
        return new Set(Array.isArray(this.selectedKeys) ? this.selectedKeys.map(String) : [])
    }

    protected expandedKeySet(): Set<string> {
        return new Set(Array.isArray(this.expandedKeys) ? this.expandedKeys.map(String) : [])
    }

    protected collapsedGroupKeySet(): Set<string> {
        return new Set(Array.isArray(this.collapsedGroupKeys) ? this.collapsedGroupKeys.map(String) : [])
    }

    protected normalizedSelectionMode(): TableSelectionMode {
        return this.selectionMode === 'single' || this.selectionMode === 'multiple' ? this.selectionMode : 'none'
    }

    protected normalizedSortDirection(): TableSortDirection { return this.sortDirection === 'desc' ? 'desc' : 'asc' }
    protected normalizedDensity(): TableDensity { return this.density === 'compact' ? 'compact' : 'comfortable' }

    protected isSortable(column: TableColumn): boolean {
        return bool(column.sortable) || Boolean(scalarText(column.sortKey).trim()) || typeof column.compare === 'function'
    }

    protected sortLabel(column: TableColumn): string {
        const nextDirection = this.sortBy === column.id && this.normalizedSortDirection() === 'asc' ? 'desc' : 'asc'
        const source = nextDirection === 'asc' ? this.sortAscendingLabel : this.sortDescendingLabel
        const columnLabel = scalarText(column.ariaLabel) || scalarText(column.header)
        return template(scalarText(source), { column: columnLabel }) || columnLabel
    }

    protected rowLabel(source: string, row: TableRowModel): string {
        const first = this.columnList()[0]
        const name = first ? valueText(this.cellValue(first, row.item)) : row.key
        const rowName = name || row.key
        return template(scalarText(source), { row: rowName }) || rowName
    }

    protected cellValue(column: TableColumn, item: TableRecord): TableValue {
        return pathValue(item, scalarText(column.field).trim() || column.id)
    }

    protected cellContent(column: TableColumn, row: TableRowModel, rowIndex: number): TableCellContent {
        const context: TableCellContext = { item: row.item, rowIndex, column, value: this.cellValue(column, row.item), depth: row.depth }
        if (typeof column.cell === 'function') {
            try { return column.cell(context) } catch (error) { this.onError(error); return null }
        }
        return valueText(context.value)
    }

    protected cellVariant(column: TableColumn, row: TableRowModel, rowIndex: number): TableCellVariant {
        const context: TableCellContext = { item: row.item, rowIndex, column, value: this.cellValue(column, row.item), depth: row.depth }
        const variant = typeof column.cellVariant === 'function' ? column.cellVariant(context) : column.cellVariant
        return ['success', 'warning', 'danger', 'muted'].includes(variant ?? '') ? variant ?? '' : ''
    }

    protected groupedRows = (): readonly TableGroupModel[] => {
        const rows = this.visibleRows()
        const groupPath = scalarText(this.groupBy).trim()
        if (!groupPath) return [{ key: '', label: '', rows }]
        const groups = new Map<string, { label: string; rows: TableRowModel[] }>()
        const ungrouped: TableRowModel[] = []
        for (const row of rows) {
            const key = valueText(pathValue(row.item, groupPath)).trim()
            if (!key) { ungrouped.push(row); continue }
            const labelPath = scalarText(this.groupLabelBy).trim()
            const label = labelPath ? valueText(pathValue(row.item, labelPath)) || key : key
            const current = groups.get(key) ?? { label, rows: [] }
            current.rows.push(row)
            groups.set(key, current)
        }
        return [
            ...(ungrouped.length ? [{ key: '', label: '', rows: ungrouped }] : []),
            ...[...groups].sort((left, right) => left[1].label.localeCompare(right[1].label)).map(([key, group]) => ({ key, ...group })),
        ]
    }

    private comparator(): ((left: TableRecord, right: TableRecord) => number) | null {
        const column = this.columnList().find(candidate => candidate.id === scalarText(this.sortBy))
        if (!column || !this.isSortable(column)) return null
        const direction = this.normalizedSortDirection() === 'asc' ? 1 : -1
        return (left, right) => direction * (typeof column.compare === 'function'
            ? column.compare(left, right)
            : defaultCompare(pathValue(left, scalarText(column.sortKey).trim() || scalarText(column.field).trim() || column.id), pathValue(right, scalarText(column.sortKey).trim() || scalarText(column.field).trim() || column.id)))
    }

    private sorted(nodes: readonly TreeNode[]): readonly TreeNode[] {
        const compare = this.comparator()
        const result = nodes.map(node => ({ ...node, children: this.sorted(node.children) }))
        return compare ? result.sort((left, right) => compare(left.item, right.item)) : result
    }

    private tree(): readonly TreeNode[] {
        const items = this.itemList()
        const itemIndex = new Map<TableRecord, number>(items.map((item, index) => [item, index]))
        const byKey = new Map<string, { item: TableRecord; key: string; children: TreeNode[] }>()
        const keyCounts = new Map<string, number>()
        items.forEach((item, index) => {
            const baseKey = this.keyFor(item, index)
            const count = keyCounts.get(baseKey) ?? 0
            keyCounts.set(baseKey, count + 1)
            const key = count === 0 ? baseKey : `${baseKey}-${count}`
            byKey.set(key, { item, key, children: [] })
        })
        const roots: Array<{ item: TableRecord; key: string; children: TreeNode[] }> = []
        const parentPath = scalarText(this.parentBy).trim()
        const createsCycle = (key: string, parentKey: string): boolean => {
            const visited = new Set([key])
            let current = parentKey
            while (current) {
                if (visited.has(current)) return true
                visited.add(current)
                const parent = byKey.get(current)
                current = parent ? valueText(pathValue(parent.item, parentPath)).trim() : ''
            }
            return false
        }
        for (const node of byKey.values()) {
            const parentKey = parentPath ? valueText(pathValue(node.item, parentPath)).trim() : ''
            const parent = parentKey && !createsCycle(node.key, parentKey) ? byKey.get(parentKey) : undefined
            if (parent) parent.children.push(node)
            else roots.push(node)
        }
        const childrenPath = scalarText(this.childrenBy).trim()
        if (childrenPath) {
            const seen = new Set<TableRecord>(items)
            const nested = (item: TableRecord, fallbackIndex: number): TreeNode => {
                const key = this.keyFor(item, itemIndex.get(item) ?? fallbackIndex)
                const rawChildren = pathValue(item, childrenPath)
                const children = Array.isArray(rawChildren) ? rawChildren.flatMap((value, index) => {
                    const record = dataRecord(value)
                    if (!record || seen.has(record)) return []
                    seen.add(record)
                    return [nested(record, index)]
                }) : []
                return { item, key, children }
            }
            return this.sorted(roots.map((node, index) => {
                const own = nested(node.item, index)
                return { ...own, children: [...node.children, ...own.children] }
            }))
        }
        return this.sorted(roots)
    }

    private visibleRows(): readonly TableRowModel[] {
        const expanded = this.expandedKeySet()
        const rows: TableRowModel[] = []
        const append = (node: TreeNode, depth: number, parentKey: string): void => {
            rows.push({ item: node.item, key: node.key, depth, parentKey, hasChildren: node.children.length > 0 })
            if (node.children.length && expanded.has(node.key)) node.children.forEach(child => append(child, depth + 1, node.key))
        }
        this.tree().forEach(root => append(root, 0, ''))
        return rows
    }

    protected selectableRows(): readonly TableRowModel[] { return this.visibleRows().filter(row => this.isSelectable(row.item)) }

    protected allVisibleSelected = (): boolean => {
        const rows = this.selectableRows()
        const selected = this.selectedKeySet()
        return rows.length > 0 && rows.every(row => selected.has(row.key))
    }

    protected someVisibleSelected = (): boolean => {
        const rows = this.selectableRows()
        const selected = this.selectedKeySet()
        return rows.some(row => selected.has(row.key)) && !rows.every(row => selected.has(row.key))
    }

    protected changeSort(column: TableColumn, originalEvent?: Event): boolean {
        if (!this.isSortable(column) || this.unavailable) return false
        const next: TableSortDirection = this.sortBy === column.id && this.normalizedSortDirection() === 'asc' ? 'desc' : 'asc'
        const detail = { column, sortBy: column.id, sortDirection: next, originalEvent }
        if (!this.request('beforesortchange', detail)) return false
        this.sortBy = column.id
        this.sortDirection = next
        this.announcement = template(scalarText(this.sortAnnouncement), {
            column: column.header,
            direction: next === 'asc' ? scalarText(this.ascendingLabel) : scalarText(this.descendingLabel),
        })
        this.syncView()
        this.emit('sortchange', detail)
        return true
    }

    protected changeSelection(keys: readonly string[], originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const unique = [...new Set(keys)]
        const selectedItems = this.itemList().filter((item, index) => unique.includes(this.keyFor(item, index)))
        const detail = { selectedKeys: unique, selectedItems, originalEvent }
        if (!this.request('beforeselectionchange', detail)) return false
        this.selectedKeys = unique
        this.announcement = template(scalarText(this.selectionAnnouncement), { count: unique.length })
        this.syncView()
        this.emit('selectionchange', detail)
        return true
    }

    protected toggleRowSelection(row: TableRowModel, originalEvent?: Event): boolean {
        if (this.normalizedSelectionMode() === 'none' || !this.isSelectable(row.item)) return false
        const selected = this.selectedKeySet()
        if (this.normalizedSelectionMode() === 'single') return this.changeSelection(selected.has(row.key) ? [] : [row.key], originalEvent)
        if (selected.has(row.key)) selected.delete(row.key)
        else selected.add(row.key)
        return this.changeSelection([...selected], originalEvent)
    }

    protected toggleAllRows(originalEvent?: Event): boolean {
        if (this.normalizedSelectionMode() !== 'multiple') return false
        const selected = this.selectedKeySet()
        const rows = this.selectableRows()
        if (this.allVisibleSelected()) rows.forEach(row => selected.delete(row.key))
        else rows.forEach(row => selected.add(row.key))
        return this.changeSelection([...selected], originalEvent)
    }

    protected toggleExpanded(row: TableRowModel, originalEvent?: Event): boolean {
        if (!row.hasChildren || this.unavailable) return false
        const expanded = this.expandedKeySet()
        const nextExpanded = !expanded.has(row.key)
        if (nextExpanded) expanded.add(row.key)
        else expanded.delete(row.key)
        const detail = { item: row.item, key: row.key, expanded: nextExpanded, expandedKeys: [...expanded], originalEvent }
        if (!this.request('beforeexpansionchange', detail)) return false
        this.expandedKeys = [...expanded]
        this.announcement = template(scalarText(this.expansionAnnouncement), {
            row: this.rowLabel('{row}', row),
            state: nextExpanded ? scalarText(this.expandedLabel) : scalarText(this.collapsedLabel),
        })
        this.syncView()
        this.emit('expansionchange', detail)
        return true
    }

    protected toggleGroup(key: string, originalEvent?: Event): boolean {
        if (!key || this.unavailable) return false
        const collapsed = this.collapsedGroupKeySet()
        const nextExpanded = collapsed.has(key)
        if (nextExpanded) collapsed.delete(key)
        else collapsed.add(key)
        const detail = { key, expanded: nextExpanded, collapsedGroupKeys: [...collapsed], originalEvent }
        if (!this.request('beforegroupchange', detail)) return false
        this.collapsedGroupKeys = [...collapsed]
        this.syncView()
        this.emit('groupchange', detail)
        return true
    }

    protected activateRow(row: TableRowModel, rowIndex: number, originalEvent?: Event): boolean {
        if (!bool(this.rowActivation) || this.unavailable) return false
        const detail = { item: row.item, key: row.key, index: rowIndex, originalEvent }
        if (!this.request('beforerowactivate', detail)) return false
        this.activeKey = row.key
        this.syncView()
        this.emit('rowactivate', detail)
        return true
    }
}
