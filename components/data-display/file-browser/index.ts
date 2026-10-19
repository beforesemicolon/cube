import '../../form/text-input/index.js'
import '../../navigation/segmented-control/index.js'
import '../../navigation/breadcrumb/index.js'
import '../table/index.js'
import '../../feedback/skeleton/index.js'
import type { TextInput } from '../../form/text-input/index.js'
import type { SegmentedControl } from '../../navigation/segmented-control/index.js'
import type { Breadcrumb } from '../../navigation/breadcrumb/index.js'
import type { Table } from '../table/index.js'
import type { TableColumn, TableRecord } from '../table/TableBase.js'
import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, safeHref, sheet, slot } from '../../core/editor-dom.js'
import { createIcon } from '../../icons/paths.js'
import { bool, scalarText } from '../../core/value.js'
import { FileBrowserBase, type FileBrowserEntry, type FileBrowserSort, type FileBrowserSortDirection, type FileBrowserView } from './FileBrowserBase.js'

interface FileRecord extends TableRecord { id: string; name: string; type: string; size: number | string; modified: string }

const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0;container-type:inline-size}
[part~=browser]{display:grid;grid-template-rows:auto auto minmax(0,1fr);min-block-size:260px;overflow:hidden;border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface)}
[part~=toolbar]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px);padding:var(--spacing-sm,8px);border-block-end:1px solid var(--color-separator);background:var(--color-surface-muted)}
[part~=toolbar-main]{display:flex;align-items:center;gap:var(--spacing-sm,8px);min-inline-size:0;flex:1}[part~=search]{display:block;inline-size:min(280px,100%)}
[part~=path]{padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border-block-end:1px solid var(--color-separator)}
[part~=content]{min-inline-size:0;min-block-size:0;overflow:auto;padding:var(--spacing-sm,8px)}
[part~=grid]{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(160px,100%),1fr));gap:var(--spacing-sm,8px)}
[part~=entry]{display:grid;grid-template-rows:minmax(80px,1fr) auto;gap:var(--spacing-sm,8px);min-inline-size:0;min-block-size:132px;padding:var(--spacing-sm,8px);text-align:start;background:var(--color-surface);border-color:var(--color-separator)}
[part~=entry][aria-selected=true]{border-color:var(--color-primary);background:var(--color-selection)}[part~=entry-preview]{display:grid;place-items:center;overflow:hidden;border-radius:var(--radius-sm);background:var(--color-surface-muted)}
[part~=entry-preview] img{inline-size:100%;block-size:100%;object-fit:cover}[part~=entry-icon]{inline-size:32px;block-size:32px;color:var(--color-primary)}
[part~=entry-copy]{display:grid;min-inline-size:0}[part~=entry-name]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}[part~=entry-meta]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px)}
[part~=state]{display:grid;place-items:center;min-block-size:180px;color:var(--color-muted-foreground);text-align:center}
@container(max-width:520px){[part~=toolbar]{align-items:stretch;flex-direction:column}[part~=toolbar-main]{inline-size:100%}[part~=search]{inline-size:100%}}
`

export class FileBrowser extends FileBrowserBase {
    private surface?: HTMLElement
    private search?: TextInput
    private views?: SegmentedControl
    private path?: Breadcrumb
    private content?: HTMLElement

    render(): Node {
        this.surface = el('section', 'browser')
        const toolbar = el('div', 'toolbar')
        const toolbarMain = el('div', 'toolbar-main')
        this.search = document.createElement('cb-text-input') as TextInput
        this.search.setAttribute('part', 'search')
        this.search.addEventListener('change', event => { event.stopPropagation(); this.setQuery(scalarText((event as CustomEvent<{ value: string }>).detail.value), event) })
        this.views = document.createElement('cb-segmented-control') as SegmentedControl
        this.views.setAttribute('part', 'view-toggle')
        this.views.addEventListener('change', event => { event.stopPropagation(); this.setView((event as CustomEvent<{ value: FileBrowserView }>).detail.value, event) })
        toolbarMain.append(this.search, slot('toolbar', '', 'toolbar-content'))
        toolbar.append(toolbarMain, this.views)
        this.path = document.createElement('cb-breadcrumb') as Breadcrumb
        this.path.setAttribute('part', 'path')
        this.path.addEventListener('navigate', event => {
            event.stopPropagation()
            const encoded = scalarText((event as CustomEvent<{ id: string }>).detail.id)
            this.navigate(encoded.startsWith('folder:') ? encoded.slice('folder:'.length) : '', event)
        })
        this.content = el('div', 'content')
        this.surface.append(toolbar, this.path, this.content)
        return fragment(sheet(css), this.surface)
    }

    protected syncView(): void {
        if (!this.surface || !this.search || !this.views || !this.path || !this.content) return
        aria(this.surface, 'aria-label', this.accessibleName())
        this.search.hidden = !bool(this.searchable)
        Object.assign(this.search, {
            label: '', accessibleLabel: scalarText(this.searchLabel), placeholder: scalarText(this.searchPlaceholder),
            value: scalarText(this.query), disabled: this.unavailable,
        })
        Object.assign(this.views, {
            accessibleLabel: this.accessibleName(), value: this.view, disabled: this.unavailable,
            items: [{ id: 'grid', label: scalarText(this.gridViewLabel), icon: 'grid' }, { id: 'table', label: scalarText(this.tableViewLabel), icon: 'layers' }],
        })
        Object.assign(this.path, {
            accessibleLabel: scalarText(this.breadcrumbLabel), expandLabel: scalarText(this.expandPathLabel),
            items: this.pathItems().map(item => ({ id: item.id ? `folder:${item.id}` : 'root:', label: item.label })),
        })
        this.content.replaceChildren()
        if (bool(this.loading)) { this.content.append(this.loadingState()); return }
        const entries = this.visibleEntries()
        if (!entries.length) {
            const state = el('div', 'state', scalarText(this.query).trim() ? scalarText(this.noMatchLabel) : scalarText(this.emptyLabel))
            state.setAttribute('role', 'status')
            this.content.append(state)
            return
        }
        this.content.append(this.view === 'table' ? this.tableView(entries) : this.gridView(entries))
    }

    private loadingState(): HTMLElement {
        const state = el('div', 'state')
        const skeleton = document.createElement('cb-skeleton') as HTMLElement & { variant: string; rows: number; columns: number; accessibleLabel: string }
        Object.assign(skeleton, { variant: this.view === 'table' ? 'table' : 'card', rows: 4, columns: 3, accessibleLabel: scalarText(this.loadingLabel) })
        state.append(skeleton)
        return state
    }

    private gridView(entries: readonly FileBrowserEntry[]): HTMLElement {
        const grid = el('div', 'grid')
        grid.setAttribute('role', this.selectionMode === 'none' ? 'list' : 'listbox')
        aria(grid, 'aria-multiselectable', this.selectionMode === 'multiple' ? true : null)
        const selected = new Set(this.selectedIds)
        for (const entry of entries) {
            const button = el('button', 'entry')
            button.type = 'button'; button.disabled = this.unavailable || entry.disabled === true
            button.dataset.id = entry.id
            button.setAttribute('role', this.selectionMode === 'none' ? 'listitem' : 'option')
            aria(button, 'aria-selected', this.selectionMode === 'none' ? null : selected.has(entry.id))
            aria(button, 'aria-label', this.entryActionLabel(entry, selected.has(entry.id)))
            const preview = el('span', 'entry-preview')
            const thumbnail = safeHref(entry.thumbnail, this.baseURI)
            if (thumbnail) { const image = document.createElement('img'); image.src = thumbnail; image.alt = ''; preview.append(image) }
            else preview.append(createIcon(entry.type === 'folder' ? 'folder' : 'file', 'entry-icon icon'))
            const copy = el('span', 'entry-copy')
            copy.append(el('span', 'entry-name', entry.name), el('span', 'entry-meta', entry.description || entry.mime || entry.type))
            button.append(preview, copy)
            button.addEventListener('click', event => entry.type === 'folder' ? this.activate(entry, event) : this.select(entry, event))
            button.addEventListener('dblclick', event => this.activate(entry, event))
            grid.append(button)
        }
        return grid
    }

    private tableView(entries: readonly FileBrowserEntry[]): Table {
        const table = document.createElement('cb-table') as Table
        table.setAttribute('part', 'table')
        const records: FileRecord[] = entries.map(entry => ({ id: entry.id, name: entry.name, type: entry.type, size: entry.size ?? '', modified: entry.modified ?? '' }))
        const entryById = new Map(entries.map(entry => [entry.id, entry]))
        const columns: TableColumn<FileRecord>[] = [
            { id: 'name', header: scalarText(this.nameLabel), field: 'name', sortable: true, minWidth: 200, cell: context => {
                const cell = el('span', 'file-name')
                cell.style.cssText = 'display:inline-flex;align-items:center;gap:8px'
                cell.append(createIcon(context.item.type === 'folder' ? 'folder' : 'file', 'icon'), document.createTextNode(context.item.name))
                return cell
            } },
            { id: 'type', header: scalarText(this.typeLabel), field: 'type', sortable: true, width: 120 },
            { id: 'size', header: scalarText(this.sizeLabel), field: 'size', sortable: true, align: 'end', width: 120 },
            { id: 'modified', header: scalarText(this.modifiedLabel), field: 'modified', sortable: true, width: 160 },
        ]
        Object.assign(table, {
            label: this.accessibleName(), accessibleLabel: this.accessibleName(), items: records, columns,
            selectionMode: this.selectionMode, selectedKeys: [...this.selectedIds], itemKey: 'id', rowActivation: true,
            sortBy: this.sortBy, sortDirection: this.sortDirection, resizable: true, stickyHeader: true,
            selectRowLabel: scalarText(this.selectEntryLabel).replaceAll('{entry}', '{row}'),
            deselectRowLabel: scalarText(this.deselectEntryLabel).replaceAll('{entry}', '{row}'),
            sortAscendingLabel: scalarText(this.sortAscendingLabel), sortDescendingLabel: scalarText(this.sortDescendingLabel),
        })
        table.addEventListener('selectionchange', event => {
            event.stopPropagation()
            const detail = (event as CustomEvent<{ selectedKeys: readonly string[] }>).detail
            this.setSelection(detail.selectedKeys, event)
        })
        table.addEventListener('rowactivate', event => {
            event.stopPropagation()
            const id = scalarText((event as CustomEvent<{ key: string }>).detail.key)
            const entry = entryById.get(id)
            if (entry) this.activate(entry, event)
        })
        table.addEventListener('sortchange', event => {
            event.stopPropagation()
            const detail = (event as CustomEvent<{ sortBy: FileBrowserSort; sortDirection: FileBrowserSortDirection }>).detail
            this.changeSort(detail.sortBy, detail.sortDirection, event)
        })
        return table
    }

    private entryActionLabel(entry: FileBrowserEntry, selected: boolean): string {
        const template = entry.type === 'folder' ? this.openEntryLabel : selected ? this.deselectEntryLabel : this.selectEntryLabel
        return scalarText(template).replaceAll('{entry}', entry.name)
    }
}

register('cb-file-browser', FileBrowser)
export { FileBrowserBase }
export type { FileBrowserProps, FileBrowserEntry, FileBrowserPathItem, FileBrowserView, FileBrowserSelectionMode, FileBrowserSort, FileBrowserSortDirection } from './FileBrowserBase.js'
