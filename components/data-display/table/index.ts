import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, slot, uid } from '../../core/editor-dom.js'
import { bool, finite, scalarText } from '../../core/value.js'
import { token as v } from '../../theme/tokens.js'
import '../../action/button/index.js'
import '../../feedback/skeleton/index.js'
import { TableBase, type TableCellContent, type TableColumn, type TableRowModel } from './TableBase.js'

const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0;container-type:inline-size}
[part~=root]{display:grid;min-inline-size:0;contain:paint;border:1px solid var(--component-table-border,${v('--color-separator')});border-radius:var(--component-table-radius,var(--radius-md));background:var(--component-table-background,${v('--color-surface')});box-shadow:var(--component-table-shadow,none);overflow:hidden}
[part~=header],[part~=footer]{display:block}:host(:not(:has([slot=header]))) [part~=header],:host(:not(:has([slot=footer]))) [part~=footer]{display:none}
[part~=viewport]{inline-size:100%;min-inline-size:0;max-inline-size:100%;overflow:auto;max-block-size:var(--component-table-max-height,none);overscroll-behavior:contain;scrollbar-gutter:stable}
[part~=viewport]:focus-visible{outline:var(--focus-ring);outline-offset:-2px}
[part~=table]{border-collapse:separate;border-spacing:0;table-layout:fixed;inline-size:100%;min-inline-size:var(--table-resolved-min-width,var(--component-table-min-width,640px));color:${v('--color-foreground')}}
[part~=column-group],[part~=column],[part~=selection-column]{border:0}
[part~=caption]{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
[part~=head]{background:var(--component-table-header-background,${v('--color-surface-muted')})}
[part~=header-row]{block-size:var(--component-table-header-height,40px)}
[part~=header-cell],[part~=group-header-cell]{position:relative;padding:var(--component-table-cell-padding-block,var(--spacing-sm,8px)) var(--component-table-cell-padding-inline,var(--spacing-md,12px));border-block-end:1px solid ${v('--color-separator')};color:${v('--color-muted-foreground')};font-size:var(--component-table-header-font-size,11px);font-weight:600;letter-spacing:.02em;text-align:start;vertical-align:middle;background:var(--component-table-header-background,${v('--color-surface-muted')})}
[part~=group-header-cell]{text-transform:uppercase;font-size:10px;letter-spacing:.08em}
:host([data-sticky-header]) [part~=head]{position:sticky;inset-block-start:0;z-index:4}
[part~=header-content]{display:flex;align-items:center;min-inline-size:0;gap:var(--spacing-xs,4px)}
[part~=header-label]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[part~=sort-button],[part~=expand-button],[part~=group-button]{--component-button-min-width:24px;--component-control-height:24px;--component-control-height-sm:24px;flex:none}
[part~=sort-button][data-active]{color:${v('--color-primary')}}
[part~=resizer]{position:absolute;z-index:2;inset-block:5px;inset-inline-end:-5px;inline-size:10px;cursor:col-resize;touch-action:none}
[part~=resizer]::after{content:'';position:absolute;inset-block:0;inset-inline-start:4px;inline-size:1px;background:${v('--color-separator')};transition:background-color var(--motion-duration-fast) ease-out,inline-size var(--motion-duration-fast) ease-out}
[part~=resizer]:hover::after,[part~=resizer]:focus-visible::after,[part~=resizer][data-resizing]::after{inline-size:2px;background:${v('--color-primary')}}
[part~=row]{display:table-row;block-size:var(--component-table-row-height,44px);background:${v('--color-surface')};transition:background-color var(--motion-duration-fast) ease-out}
:host([data-striped]) [part~=row]:nth-of-type(even){background:var(--component-table-stripe,${v('--color-surface-muted')})}
[part~=row]:hover,[part~=row]:hover [part~=cell]{background:${v('--color-active')}}
[part~=row][data-active],[part~=row][data-active] [part~=cell]{background:${v('--color-selection')}}[part~=row][data-active]{box-shadow:inset 3px 0 0 ${v('--color-primary')}}
[part~=row][data-selected],[part~=row][data-selected] [part~=cell]{background:color-mix(in srgb,${v('--color-selection')} 72%,${v('--color-surface')})}
[part~=row][tabindex]:focus-visible{outline:var(--focus-ring);outline-offset:-2px}
[part~=cell]{padding:var(--component-table-cell-padding-block,var(--spacing-sm,8px)) var(--component-table-cell-padding-inline,var(--spacing-md,12px));border-block-end:1px solid ${v('--color-separator')};vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
:host([data-wrap]) [part~=cell],[part~=cell][data-wrap]{white-space:normal;overflow-wrap:anywhere}
[part~=cell][data-align=center],[part~=header-cell][data-align=center]{text-align:center}[part~=cell][data-align=end],[part~=header-cell][data-align=end]{text-align:end;font-variant-numeric:tabular-nums}
[part~=cell][data-variant=success]{color:${v('--color-success')}}[part~=cell][data-variant=warning]{color:${v('--color-warning')}}[part~=cell][data-variant=danger]{color:${v('--color-danger')}}[part~=cell][data-variant=muted]{color:${v('--color-muted-foreground')}}
[part~=primary-cell]{padding-inline-start:var(--component-table-cell-padding-inline,var(--spacing-md,12px))}
[part~=tree-cell]{display:flex;align-items:center;min-inline-size:0;gap:var(--spacing-xs,4px);block-size:100%}
[part~=tree-indent]{position:relative;align-self:stretch;inline-size:calc(var(--table-depth,0) * var(--component-table-tree-indent,28px));min-block-size:24px;flex:none;background:repeating-linear-gradient(to right,transparent 0 calc(var(--component-table-tree-indent,28px) - 1px),color-mix(in srgb,${v('--color-separator')} 74%,transparent) calc(var(--component-table-tree-indent,28px) - 1px) var(--component-table-tree-indent,28px))}
[part~=tree-indent]::after{content:'';position:absolute;inset-inline-end:0;inset-block-start:50%;inline-size:calc(var(--component-table-tree-indent,28px) * .4);border-block-start:1px solid ${v('--color-separator')}}
[part~=tree-spacer]{inline-size:24px;flex:none}[part~=cell-content]{min-inline-size:0;overflow:hidden;text-overflow:inherit}
[part~=row][data-parent] [part~=primary-cell] [part~=cell-content]{font-weight:600}
[part~=selection-cell]{inline-size:44px;min-inline-size:44px;max-inline-size:44px;text-align:center;padding-inline:var(--spacing-sm,8px)}
[part~=selection-control]{appearance:none;display:inline-grid;place-items:center;inline-size:16px;block-size:16px;margin:0;border:1px solid ${v('--color-border')};background:${v('--color-surface')};cursor:pointer}
input[type=checkbox][part~=selection-control]{border-radius:var(--radius-xs,3px)}input[type=radio][part~=selection-control]{border-radius:50%}
[part~=selection-control]:checked{border-color:${v('--color-primary')};background:${v('--color-primary')}}[part~=selection-control]:checked::after{content:'';inline-size:7px;block-size:4px;border-inline-start:2px solid ${v('--color-primary-foreground')};border-block-end:2px solid ${v('--color-primary-foreground')};rotate:-45deg;translate:0 -1px}
input[type=radio][part~=selection-control]:checked::after{inline-size:6px;block-size:6px;border:0;border-radius:50%;background:${v('--color-primary-foreground')};rotate:0;translate:0}
[part~=selection-control]:indeterminate{border-color:${v('--color-primary')};background:${v('--color-primary')}}[part~=selection-control]:indeterminate::after{content:'';inline-size:8px;block-size:2px;background:${v('--color-primary-foreground')}}
[part~=selection-control]:disabled{cursor:not-allowed;opacity:var(--component-disabled-opacity,.5)}
[part~=group-row]{background:var(--component-table-group-background,${v('--color-surface-muted')})}[part~=group-cell]{padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border-block-end:1px solid ${v('--color-separator')}}[part~=group-content]{display:flex;align-items:center;gap:var(--spacing-xs,4px);font-weight:600}[part~=group-count]{color:${v('--color-muted-foreground')};font-variant-numeric:tabular-nums}
[part~=empty],[part~=loading]{display:grid;place-items:center;min-block-size:var(--component-table-state-height,160px);padding:var(--spacing-lg,20px);color:${v('--color-muted-foreground')};text-align:center}[part~=loading]{display:block}
[part~=sticky]{position:sticky;inset-inline-start:var(--table-sticky-offset,0);z-index:2;box-shadow:1px 0 ${v('--color-separator')};background:inherit}[part~=header-cell][part~=sticky],[part~=group-header-cell][part~=sticky]{z-index:5;background:var(--component-table-header-background,${v('--color-surface-muted')})}
[part~=live]{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
:host([data-resizing]),:host([data-resizing]) *{cursor:col-resize!important;user-select:none!important}
:host([data-density=compact]){--component-table-row-height:34px;--component-table-header-height:34px;--component-table-cell-padding-block:4px;--component-table-cell-padding-inline:8px}
@container (max-width:560px){[part~=table]{--component-table-cell-padding-inline:8px;--component-table-min-width:520px}[part~=resizer]{display:none}}
@media(pointer:coarse){[part~=resizer]{display:none}[part~=sort-button],[part~=expand-button],[part~=group-button]{--component-control-height:36px;--component-control-height-sm:36px}}
@media(forced-colors:active){[part~=row][data-active],[part~=row][data-selected]{outline:2px solid Highlight;outline-offset:-2px}}
`

interface IconButtonElement extends HTMLElement {
    label: string
    accessibleLabel: string
    icon: string
    iconOnly: boolean
    variant: string
    size: string
}

function iconButton(icon: string, label: string, part: string, action: (event: Event) => void): IconButtonElement {
    const button = document.createElement('cb-button') as IconButtonElement
    Object.assign(button, { icon, iconOnly: true, label, accessibleLabel: label, variant: 'ghost', size: 'xs' })
    button.setAttribute('part', part)
    button.addEventListener('click', event => event.stopPropagation())
    button.addEventListener('action', event => { event.stopPropagation(); action(event) })
    return button
}

function appendContent(target: HTMLElement, content: TableCellContent): void {
    if (content instanceof Node) target.append(content)
    else if (content !== null && content !== undefined) target.textContent = String(content)
}

function cssSize(value: string | number | undefined, fallback = 'auto'): string {
    return typeof value === 'number' && Number.isFinite(value) ? `${value}px` : scalarText(value).trim() || fallback
}

function pixels(value: string | number | undefined, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const parsed = Number.parseFloat(scalarText(value))
    return Number.isFinite(parsed) ? parsed : fallback
}

const selectionColumnWidth = 44
const defaultColumnWidth = 160

export class Table extends TableBase {
    private container?: HTMLElement
    private viewport?: HTMLElement
    private live?: HTMLElement
    private readonly radioName = uid('cb-table-selection')
    private readonly columnWidths = new Map<string, number>()

    render(): Node {
        this.container = el('section', 'root table-root')
        const header = el('header', 'header')
        header.append(slot('header', '', 'header-slot'))
        this.viewport = el('div', 'viewport')
        this.viewport.tabIndex = 0
        const footer = el('footer', 'footer')
        footer.append(slot('footer', '', 'footer-slot'))
        this.live = el('div', 'live')
        this.live.setAttribute('aria-live', 'polite')
        this.live.setAttribute('aria-atomic', 'true')
        this.container.append(header, this.viewport, footer, this.live)
        return fragment(sheet(css), this.container)
    }

    protected syncView(): void {
        if (!this.container || !this.viewport || !this.live) return
        this.dataset.density = this.normalizedDensity()
        this.toggleAttribute('data-striped', bool(this.striped))
        this.toggleAttribute('data-wrap', bool(this.wrap))
        this.toggleAttribute('data-sticky-header', bool(this.stickyHeader))
        this.live.textContent = this.announcement
        const left = this.viewport.scrollLeft
        const top = this.viewport.scrollTop
        this.viewport.replaceChildren()
        const viewportLabel = this.accessibleName()
        if (viewportLabel) this.viewport.setAttribute('aria-label', viewportLabel)
        else this.viewport.removeAttribute('aria-label')
        if (bool(this.loading)) this.viewport.append(this.loadingState())
        else if (!this.itemList().length || !this.columnList().length) this.viewport.append(this.emptyState())
        else this.viewport.append(this.createTable())
        this.viewport.scrollLeft = left
        this.viewport.scrollTop = top
        queueMicrotask(() => this.applyStickyOffsets())
    }

    private loadingState(): HTMLElement {
        const state = el('div', 'loading state')
        const skeleton = document.createElement('cb-skeleton') as HTMLElement & { variant: string; rows: number; columns: number; animated: boolean; accessibleLabel: string }
        Object.assign(skeleton, {
            variant: 'table', rows: Math.max(1, Math.round(finite(this.loadingRows, 5))),
            columns: Math.max(1, this.columnList().length), animated: true, accessibleLabel: scalarText(this.loadingLabel),
        })
        skeleton.setAttribute('part', 'loading-skeleton')
        state.append(skeleton)
        return state
    }

    private emptyState(): HTMLElement {
        const state = el('div', 'empty state')
        state.setAttribute('role', 'status')
        state.append(slot('empty', scalarText(this.emptyLabel), 'empty-slot'))
        return state
    }

    private createTable(): HTMLTableElement {
        const table = el('table', 'table')
        const columns = this.columnList()
        const selectionWidth = this.normalizedSelectionMode() === 'none' ? 0 : selectionColumnWidth
        const columnWidth = columns.reduce((total, column) => total + pixels(column.minWidth ?? column.width, defaultColumnWidth), 0)
        table.style.setProperty('--table-resolved-min-width', `${Math.max(320, selectionWidth + columnWidth)}px`)
        if (columns.every(column => this.columnWidths.has(column.id))) this.updateTableWidth(table, columns)
        const caption = el('caption', 'caption', this.accessibleName())
        table.append(caption, this.createColumnGroup(columns), this.createHead(), this.createBody())
        return table
    }

    private createColumnGroup(columns: readonly TableColumn[]): HTMLTableColElement {
        const group = el('colgroup', 'column-group')
        if (this.normalizedSelectionMode() !== 'none') {
            const selection = el('col', 'selection-column')
            selection.style.width = `${selectionColumnWidth}px`
            group.append(selection)
        }
        for (const column of columns) {
            const col = el('col', 'column')
            col.dataset.columnId = column.id
            col.style.width = this.columnWidths.has(column.id)
                ? `${this.columnWidths.get(column.id)}px`
                : cssSize(column.width ?? column.minWidth, `${defaultColumnWidth}px`)
            group.append(col)
        }
        return group
    }

    private createHead(): HTMLTableSectionElement {
        const head = el('thead', 'head')
        const columns = this.columnList()
        const hasGroups = columns.some(column => scalarText(column.group))
        if (hasGroups) head.append(this.createGroupHeader(columns))
        const row = el('tr', 'header-row')
        if (this.normalizedSelectionMode() !== 'none') row.append(this.selectionHeader(hasGroups))
        columns.forEach((column, index) => row.append(this.headerCell(column, index, hasGroups)))
        head.append(row)
        return head
    }

    private createGroupHeader(columns: readonly TableColumn[]): HTMLTableRowElement {
        const row = el('tr', 'header-row group-header-row')
        if (this.normalizedSelectionMode() !== 'none') {
            const cell = el('th', 'selection-cell group-header-cell sticky')
            cell.rowSpan = 2
            cell.dataset.stickyIndex = '0'
            row.append(cell)
        }
        for (let index = 0; index < columns.length;) {
            const group = scalarText(columns[index]?.group)
            let span = 1
            while (index + span < columns.length && scalarText(columns[index + span]?.group) === group) span += 1
            const cell = el('th', 'group-header-cell', group)
            cell.scope = group ? 'colgroup' : 'col'
            if (group) cell.colSpan = span
            else cell.rowSpan = 2
            if (index < Math.max(0, Math.round(finite(this.stickyColumns, 0)))) this.makeSticky(cell, index)
            row.append(cell)
            index += span
        }
        return row
    }

    private selectionHeader(grouped: boolean): HTMLTableCellElement {
        const cell = el('th', 'header-cell selection-cell sticky')
        cell.scope = 'col'
        if (grouped) cell.hidden = true
        cell.dataset.stickyIndex = '0'
        if (this.normalizedSelectionMode() === 'multiple') {
            const input = el('input', 'selection-control')
            input.type = 'checkbox'
            input.checked = this.allVisibleSelected()
            input.indeterminate = this.someVisibleSelected()
            input.disabled = this.unavailable || !this.selectableRows().length
            aria(input, 'aria-label', scalarText(input.checked ? this.deselectAllLabel : this.selectAllLabel) || this.accessibleName())
            input.addEventListener('click', event => event.stopPropagation())
            input.addEventListener('change', event => { event.stopPropagation(); this.toggleAllRows(event) })
            cell.append(input)
        }
        return cell
    }

    private headerCell(column: TableColumn, index: number, grouped: boolean): HTMLTableCellElement {
        const cell = el('th', 'header-cell')
        cell.scope = 'col'
        cell.dataset.columnId = column.id
        cell.dataset.align = column.align ?? 'start'
        if (grouped && !scalarText(column.group)) cell.hidden = true
        const content = el('span', 'header-content')
        content.append(el('span', 'header-label', scalarText(column.header)))
        if (this.isSortable(column)) {
            const active = scalarText(this.sortBy) === column.id
            const sort = iconButton(active && this.normalizedSortDirection() === 'asc' ? 'up' : 'down', this.sortLabel(column), 'sort-button', event => this.changeSort(column, event))
            sort.toggleAttribute('data-active', active)
            content.append(sort)
            aria(cell, 'aria-sort', active ? `${this.normalizedSortDirection()}ending` : 'none')
        }
        cell.append(content)
        if (bool(this.resizable)) cell.append(this.columnResizer(column))
        if (index < Math.max(0, Math.round(finite(this.stickyColumns, 0)))) this.makeSticky(cell, index)
        return cell
    }

    private columnResizer(column: TableColumn): HTMLElement {
        const handle = el('span', 'resizer')
        handle.tabIndex = 0
        handle.setAttribute('role', 'separator')
        handle.setAttribute('aria-orientation', 'vertical')
        const minimum = pixels(column.minWidth, 72)
        const maximum = pixels(column.maxWidth, 2000)
        const current = this.columnWidths.get(column.id) ?? pixels(column.width ?? column.minWidth, 160)
        aria(handle, 'aria-valuemin', Math.round(minimum))
        aria(handle, 'aria-valuemax', Math.round(maximum))
        aria(handle, 'aria-valuenow', Math.round(Math.min(maximum, Math.max(minimum, current))))
        const columnLabel = scalarText(column.ariaLabel) || scalarText(column.header)
        aria(handle, 'aria-label', scalarText(this.resizeColumnLabel).replaceAll('{column}', columnLabel) || columnLabel)
        handle.dataset.columnId = column.id
        handle.addEventListener('pointerdown', event => this.startResize(column, handle, event))
        handle.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            this.freezeColumnWidths()
            const current = this.columnWidths.get(column.id) ?? pixels(column.width ?? column.minWidth, defaultColumnWidth)
            const proposed = event.key === 'Home'
                ? minimum
                : event.key === 'End'
                    ? (Number.isFinite(maximum) ? maximum : current + 160)
                    : current + (event.key === 'ArrowRight' ? 16 : -16)
            this.resizeColumn(column, proposed)
        })
        return handle
    }

    private startResize(column: TableColumn, handle: HTMLElement, event: PointerEvent): void {
        if (event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        this.freezeColumnWidths()
        const header = handle.closest('th')
        if (!(header instanceof HTMLElement)) return
        const startX = event.clientX
        const startWidth = this.columnWidths.get(column.id) ?? header.getBoundingClientRect().width
        const viewport = this.viewport
        const startScrollLeft = viewport?.scrollLeft ?? 0
        const preserveScrollPosition = (): void => {
            if (viewport) viewport.scrollLeft = startScrollLeft
        }
        let finished = false
        const move = (moveEvent: PointerEvent): void => {
            moveEvent.preventDefault()
            this.resizeColumn(column, startWidth + moveEvent.clientX - startX, false)
            preserveScrollPosition()
            queueMicrotask(preserveScrollPosition)
        }
        const stop = (endEvent: PointerEvent): void => {
            if (finished) return
            finished = true
            handle.removeEventListener('pointermove', move)
            handle.removeEventListener('pointerup', stop)
            handle.removeEventListener('pointercancel', stop)
            handle.removeEventListener('lostpointercapture', stop)
            if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId)
            handle.toggleAttribute('data-resizing', false)
            this.toggleAttribute('data-resizing', false)
            preserveScrollPosition()
            this.emit('columnresize', { column, width: this.columnWidths.get(column.id), originalEvent: endEvent })
        }
        handle.setPointerCapture(event.pointerId)
        handle.toggleAttribute('data-resizing', true)
        this.toggleAttribute('data-resizing', true)
        handle.addEventListener('pointermove', move)
        handle.addEventListener('pointerup', stop)
        handle.addEventListener('pointercancel', stop)
        handle.addEventListener('lostpointercapture', stop)
    }

    private resizeColumn(column: TableColumn, proposed: number, announce = true): void {
        const width = Math.min(pixels(column.maxWidth, Number.POSITIVE_INFINITY), Math.max(pixels(column.minWidth, 72), proposed))
        this.columnWidths.set(column.id, width)
        const table = this.viewport?.querySelector<HTMLTableElement>('[part~="table"]')
        if (table) {
            const col = [...table.querySelectorAll<HTMLTableColElement>('col[data-column-id]')]
                .find(candidate => candidate.dataset.columnId === column.id)
            if (col) col.style.width = `${width}px`
            this.updateTableWidth(table, this.columnList())
            const resizer = [...table.querySelectorAll<HTMLElement>('[part~="resizer"][data-column-id]')]
                .find(candidate => candidate.dataset.columnId === column.id)
            if (resizer) aria(resizer, 'aria-valuenow', Math.round(width))
        }
        queueMicrotask(() => this.applyStickyOffsets())
        if (announce) this.emit('columnresize', { column, width })
    }

    private freezeColumnWidths(): void {
        const table = this.viewport?.querySelector<HTMLTableElement>('[part~="table"]')
        if (!table) return
        const headers = [...table.querySelectorAll<HTMLTableCellElement>('th[data-column-id]')]
        const measurements = this.columnList().map(column => ({
            column,
            width: headers.find(header => header.dataset.columnId === column.id)?.getBoundingClientRect().width,
        }))
        for (const measurement of measurements) {
            if (measurement.width && measurement.width > 0) this.columnWidths.set(measurement.column.id, measurement.width)
        }
        for (const col of table.querySelectorAll<HTMLTableColElement>('col[data-column-id]')) {
            const columnId = col.dataset.columnId ?? ''
            const width = this.columnWidths.get(columnId)
            if (width !== undefined) col.style.width = `${width}px`
        }
        this.updateTableWidth(table, this.columnList())
    }

    private updateTableWidth(table: HTMLTableElement, columns: readonly TableColumn[]): void {
        if (!columns.every(column => this.columnWidths.has(column.id))) return
        const selectionWidth = this.normalizedSelectionMode() === 'none' ? 0 : selectionColumnWidth
        const width = columns.reduce((total, column) => total + (this.columnWidths.get(column.id) ?? 0), selectionWidth)
        table.style.inlineSize = `max(100%, ${Math.ceil(width)}px)`
    }

    private createBody(): HTMLTableSectionElement {
        const body = el('tbody', 'body')
        let rowIndex = 0
        for (const group of this.groupedRows()) {
            if (group.key) body.append(this.groupRow(group.key, group.label, group.rows.length))
            if (group.key && this.collapsedGroupKeySet().has(group.key)) continue
            for (const row of group.rows) body.append(this.dataRow(row, rowIndex++))
        }
        return body
    }

    private groupRow(key: string, label: string, count: number): HTMLTableRowElement {
        const row = el('tr', 'group-row')
        const cell = el('th', 'group-cell')
        cell.colSpan = this.columnList().length + (this.normalizedSelectionMode() === 'none' ? 0 : 1)
        const content = el('div', 'group-content')
        const expanded = !this.collapsedGroupKeySet().has(key)
        const buttonLabel = scalarText(expanded ? this.collapseGroupLabel : this.expandGroupLabel).replaceAll('{group}', label) || label
        content.append(iconButton(expanded ? 'down' : 'right', buttonLabel, 'group-button', event => this.toggleGroup(key, event)), el('span', 'group-label', label), el('span', 'group-count', String(count)))
        cell.append(content)
        row.append(cell)
        return row
    }

    private dataRow(rowModel: TableRowModel, rowIndex: number): HTMLTableRowElement {
        const row = el('tr', 'row data-row')
        row.dataset.rowKey = rowModel.key
        row.dataset.parentKey = rowModel.parentKey
        row.dataset.depth = String(rowModel.depth)
        row.toggleAttribute('data-child', rowModel.depth > 0)
        row.toggleAttribute('data-parent', rowModel.hasChildren)
        row.toggleAttribute('data-expanded', rowModel.hasChildren && this.expandedKeySet().has(rowModel.key))
        row.toggleAttribute('data-selected', this.selectedKeySet().has(rowModel.key))
        row.toggleAttribute('data-active', scalarText(this.activeKey) === rowModel.key)
        aria(row, 'aria-current', scalarText(this.activeKey) === rowModel.key ? true : null)
        if (bool(this.rowActivation) && !this.unavailable) {
            row.tabIndex = 0
            row.addEventListener('click', event => { if (!this.isInteractiveEvent(event, row)) this.activateRow(rowModel, rowIndex, event) })
            row.addEventListener('keydown', event => {
                if (event.target !== row || event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                this.activateRow(rowModel, rowIndex, event)
            })
        }
        if (this.normalizedSelectionMode() !== 'none') row.append(this.selectionCell(rowModel))
        this.columnList().forEach((column, columnIndex) => row.append(this.dataCell(column, columnIndex, rowModel, rowIndex)))
        return row
    }

    private selectionCell(row: TableRowModel): HTMLTableCellElement {
        const cell = el('td', 'cell selection-cell sticky')
        cell.dataset.stickyIndex = '0'
        const input = el('input', 'selection-control')
        input.type = this.normalizedSelectionMode() === 'single' ? 'radio' : 'checkbox'
        if (input.type === 'radio') input.name = this.radioName
        const selected = this.selectedKeySet().has(row.key)
        input.checked = selected
        input.disabled = this.unavailable || !this.isSelectable(row.item)
        aria(input, 'aria-label', this.rowLabel(selected ? this.deselectRowLabel : this.selectRowLabel, row))
        input.addEventListener('click', event => event.stopPropagation())
        input.addEventListener('change', event => { event.stopPropagation(); this.toggleRowSelection(row, event) })
        cell.append(input)
        return cell
    }

    private dataCell(column: TableColumn, columnIndex: number, row: TableRowModel, rowIndex: number): HTMLTableCellElement {
        const part = columnIndex === 0 ? 'cell primary-cell' : 'cell'
        const cell = el('td', part)
        cell.dataset.align = column.align ?? 'start'
        cell.dataset.columnId = column.id
        cell.dataset.variant = this.cellVariant(column, row, rowIndex)
        cell.toggleAttribute('data-wrap', bool(column.wrap))
        if (columnIndex === 0) {
            const tree = el('div', 'tree-cell')
            if (row.depth > 0) {
                const indent = el('span', 'tree-indent')
                indent.style.setProperty('--table-depth', String(row.depth))
                indent.setAttribute('aria-hidden', 'true')
                tree.append(indent)
            }
            if (row.hasChildren) {
                const expanded = this.expandedKeySet().has(row.key)
                tree.append(iconButton(expanded ? 'down' : 'right', this.rowLabel(expanded ? this.collapseRowLabel : this.expandRowLabel, row), 'expand-button', event => this.toggleExpanded(row, event)))
            } else tree.append(el('span', 'tree-spacer'))
            const content = el('span', 'cell-content')
            appendContent(content, this.cellContent(column, row, rowIndex))
            tree.append(content)
            cell.append(tree)
        } else appendContent(cell, this.cellContent(column, row, rowIndex))
        if (columnIndex < Math.max(0, Math.round(finite(this.stickyColumns, 0)))) this.makeSticky(cell, columnIndex)
        return cell
    }

    private makeSticky(cell: HTMLTableCellElement, columnIndex: number): void {
        cell.setAttribute('part', `${cell.getAttribute('part') ?? ''} sticky`.trim())
        cell.dataset.stickyIndex = String(columnIndex + (this.normalizedSelectionMode() === 'none' ? 0 : 1))
    }

    private applyStickyOffsets(): void {
        if (!this.container) return
        const cells = [...this.container.querySelectorAll<HTMLElement>('[data-sticky-index]')]
        const widths = new Map<number, number>()
        for (const cell of cells) {
            const index = Number(cell.dataset.stickyIndex)
            if (!widths.has(index)) widths.set(index, cell.getBoundingClientRect().width)
        }
        for (const cell of cells) {
            const index = Number(cell.dataset.stickyIndex)
            let offset = 0
            for (let current = 0; current < index; current += 1) offset += widths.get(current) ?? 0
            cell.style.setProperty('--table-sticky-offset', `${offset}px`)
        }
    }

    private isInteractiveEvent(event: Event, row: HTMLTableRowElement): boolean {
        return event.composedPath().some(target => target !== row && target instanceof Element && (
            target.matches('button,a,input,select,textarea,[role=button],[role=checkbox],[role=radio]') ||
            ['cb-button', 'cb-button', 'cb-link', 'cb-select', 'cb-checkbox', 'cb-radio-group'].includes(target.localName)
        ))
    }
}

register('cb-table', Table)
export { TableBase }
export type {
    TableAlign, TableCellContent, TableCellContext, TableCellVariant, TableColumn, TableDensity,
    TableGroupModel, TablePrimitive, TableProps, TableRecord, TableRowModel, TableSelectionMode,
    TableSortDirection, TableValue,
} from './TableBase.js'
