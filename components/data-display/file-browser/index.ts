import { register } from '../../core/Component.js'
import {
    html,
    is,
    isNot,
    pick,
    repeat,
    type Template,
    when,
} from '../../core/runtime.js'
import { safeHref } from '../../core/url.js'
import { scalarText } from '../../core/value.js'
import type { TableColumn, TableRecord } from '../table/TableBase.js'
import {
    FileBrowserBase,
    type FileBrowserAction,
    type FileBrowserEntry,
    type FileBrowserSort,
    type FileBrowserSortDirection,
    type FileBrowserView,
} from './FileBrowserBase.js'
import componentStylesheet from './styles.css?inline'

interface FileRecord extends TableRecord {
    id: string
    name: string
    type: string
    size: number | string
    modified: string
    selectable: boolean
}

interface ActionChangeDetail {
    item: FileBrowserAction
}

export class FileBrowser extends FileBrowserBase {
    stylesheet = componentStylesheet
    private pendingFolderSelection: ReturnType<typeof setTimeout> | null = null

    render(): Template {
        return html`<cb-col ref="browser" part="browser" gap="md" role="region" tabindex="-1" aria-label=${this.accessibleName}>
            ${when(
                this.props.toolbarEnabled,
                () =>
                    html`<cb-action-bar part="toolbar" wrap accessible-label=${this.accessibleName}>
                        <div part="toolbar-main" slot="start">
                            <cb-text-input
                                ref="search"
                                part="search"
                                hidden=${isNot(this.props.searchable)}
                                accessible-label=${this.props.searchLabel}
                                placeholder=${this.props.searchPlaceholder}
                                value=${this.props.query}
                                disabled=${() => this.unavailable}
                                onchange=${(
                                    event: CustomEvent<{ value: string }>
                                ) => {
                                    event.stopPropagation()
                                    this.setQuery(event.detail.value, event)
                                }}
                            ></cb-text-input>
                            ${when(this.showSelectedFiles, this.selectionTemplate)}
                            <slot name="toolbar" part="toolbar-content"></slot>
                        </div>
                        <div part="toolbar-actions">
                            <cb-button
                                part="refresh"
                                icon="reset"
                                icon-only
                                label=${this.props.refreshLabel}
                                hidden=${isNot(this.props.refreshEnabled)}
                                loading=${this.props.refreshing}
                                disabled=${() =>
                                    this.unavailable ||
                                    this.refreshDisabled ||
                                    this.refreshing}
                                onaction=${(event: Event) => {
                                    event.stopPropagation()
                                    this.requestRefresh(event)
                                }}
                            ></cb-button>
                            <cb-button
                                part="create-folder"
                                icon="folderAdd"
                                label=${this.props.createFolderLabel}
                                hidden=${isNot(this.props.createFolderEnabled)}
                                disabled=${() => this.unavailable || this.createFolderDisabled}
                                onaction=${(event: Event) => {
                                    event.stopPropagation()
                                    this.requestCreateFolder(event)
                                }}
                            ></cb-button>
                            <cb-button
                                part="upload"
                                icon="upload"
                                label=${this.props.uploadLabel}
                                hidden=${isNot(this.props.uploadEnabled)}
                                loading=${this.props.uploading}
                                disabled=${() =>
                                    this.unavailable ||
                                    this.uploadDisabled ||
                                    this.uploading}
                                onaction=${(event: Event) => {
                                    event.stopPropagation()
                                    this.requestUpload(event)
                                }}
                            ></cb-button>
                            ${when(
                                pick(this.selectionActions, 'length'),
                                () =>
                                    html`<cb-dropdown
                                        part="selection-actions"
                                        icon="more"
                                        icon-only
                                        label=${this.props.selectionActionsLabel}
                                        items=${this.selectionActions}
                                        onchange=${(
                                            event: CustomEvent<ActionChangeDetail>
                                        ) => {
                                            event.stopPropagation()
                                            this.triggerAction(
                                                event.detail.item,
                                                undefined,
                                                event
                                            )
                                        }}
                                    ></cb-dropdown>`
                            )}
                            <cb-segmented-control
                                part="view-toggle"
                                accessible-label=${this.accessibleName}
                                value=${this.props.view}
                                disabled=${() => this.unavailable}
                                items=${() => [
                                    {
                                        id: 'grid',
                                        label: this.gridViewLabel,
                                        icon: 'grid',
                                    },
                                    {
                                        id: 'table',
                                        label: this.tableViewLabel,
                                        icon: 'layers',
                                    },
                                ]}
                                onchange=${(
                                    event: CustomEvent<{
                                        value: FileBrowserView
                                    }>
                                ) => {
                                    event.stopPropagation()
                                    this.setView(event.detail.value, event)
                                }}
                            ></cb-segmented-control>
                        </div>
                    </cb-action-bar>`
            )}
            ${when(
                () => !this.toolbarEnabled && this.showSelectedFiles(),
                this.selectionTemplate
            )}
            <cb-breadcrumb
                part="path"
                accessible-label=${this.props.breadcrumbLabel}
                expand-label=${this.props.expandPathLabel}
                items=${() =>
                    this.resolvedPathItems().map((item) => ({
                        id: item.id ? `folder:${item.id}` : 'root:',
                        label: item.label,
                    }))}
                onnavigate=${(event: CustomEvent<{ id: string }>) => {
                    event.stopPropagation()
                    const id = event.detail.id
                    this.navigate(
                        id.startsWith('folder:') ? id.slice(7) : '',
                        event
                    )
                }}
            ></cb-breadcrumb>
            <div part="content">
                ${when(
                    this.props.loading,
                    () =>
                        html`<div part="state">
                            <cb-skeleton
                                variant=${() => (this.view === 'table' ? 'table' : 'card')}
                                rows="4"
                                columns="3"
                                accessible-label=${this.props.loadingLabel}
                            ></cb-skeleton>
                        </div>`,
                    () =>
                        when(
                            isNot(pick(this.visibleEntries, 'length')),
                            () =>
                                html`<div part="state" role="status">
                                    <cb-empty-state
                                        icon=${this.props.emptyIcon}
                                        heading=${() =>
                                            scalarText(this.query).trim()
                                                ? this.noMatchLabel
                                                : this.emptyLabel}
                                    ></cb-empty-state>
                                </div>`,
                            () =>
                                when(
                                    is(this.props.view, 'table'),
                                    this.tableTemplate,
                                    this.gridTemplate
                                )
                        )
                )}
            </div>
        </cb-col>`
    }

    private gridTemplate = (): Template =>
        html`<div
            part="grid"
            role=${() => (this.selectionMode === 'none' ? 'list' : 'listbox')}
            aria-multiselectable=${() =>
                this.selectionMode === 'multiple' ||
                this.selectionMode === 'actions'
                    ? true
                    : null}
        >
            ${repeat(
                this.visibleEntries,
                (entry) =>
                    html`<div part="entry-shell" data-id=${entry.id}>
                        <cb-button
                            ref="entries"
                            part="entry"
                            exportparts="control:entry-control,label:entry-label,button-label:entry-label,icon:entry-icon,description:entry-description"
                            data-bare
                            data-semantic-host
                            disabled=${() => this.entryDisabled(entry)}
                            role=${() => (this.selectionMode === 'none' ? 'listitem' : 'option')}
                            aria-selected=${() =>
                                this.entrySelectable(entry)
                                    ? this.selectedIds.includes(entry.id)
                                    : null}
                            accessible-label=${() =>
                                this.entryActionLabel(
                                    entry,
                                    this.selectedIds.includes(entry.id)
                                )}
                            onaction=${(event: Event) => {
                                event.stopPropagation()
                                this.engageEntry(entry, event)
                            }}
                            ondblclick=${(event: MouseEvent) => this.openEntry(entry, event)}
                        >
                            <span part="entry-preview">
                                ${when(
                                    is(() =>
                                        safeHref(entry.thumbnail, this.baseURI)
                                    ),
                                    () =>
                                        html`<img
                                            src=${() => safeHref(entry.thumbnail, this.baseURI)}
                                            alt=""
                                        />`,
                                    () =>
                                        html`<cb-icon
                                            name=${entry.icon || (entry.type === 'folder' ? 'folder' : 'file')}
                                            part="entry-icon icon"
                                            decorative
                                        ></cb-icon>`
                                )}
                                ${when(
                                    () => this.selectedIds.includes(entry.id),
                                    () =>
                                        html`<cb-icon
                                            name="check"
                                            part="selection-check"
                                            decorative
                                        ></cb-icon>`
                                )}
                            </span>
                            <span part="entry-copy">
                                <span part="entry-name">${entry.name}</span>
                                <span part="entry-meta"
                                    >${[
                                        entry.description ||
                                            entry.mime ||
                                            entry.type,
                                        ...(entry.metadata ?? []),
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}</span
                                >
                            </span>
                        </cb-button>
                        ${when(
                            () => this.entryActions(entry).length > 0,
                            () =>
                                html`<cb-dropdown
                                    part="entry-actions"
                                    icon="more"
                                    icon-only
                                    size="sm"
                                    label=${this.props.actionMenuLabel}
                                    items=${() => this.entryActions(entry)}
                                    onchange=${(
                                        event: CustomEvent<ActionChangeDetail>
                                    ) => {
                                        event.stopPropagation()
                                        this.triggerAction(
                                            event.detail.item,
                                            entry,
                                            event
                                        )
                                    }}
                                ></cb-dropdown>`
                        )}
                    </div>`,
                { key: (entry) => entry.id }
            )}
        </div>`

    private tableTemplate = (): Template =>
        html`<cb-table
            part="table"
            label=${this.accessibleName}
            accessible-label=${this.accessibleName}
            items=${() =>
                this.visibleEntries().map((entry) => ({
                    id: entry.id,
                    name: entry.name,
                    type: entry.type,
                    size: entry.size ?? '',
                    modified: entry.modified ?? '',
                    selectable:
                        this.entrySelectable(entry) &&
                        !this.entryDisabled(entry),
                }))}
            selectable-field="selectable"
            columns=${this.tableColumns}
            selection-mode=${() =>
                this.selectionMode === 'actions'
                    ? 'multiple'
                    : this.selectionMode}
            selected-keys=${() => [...this.selectedIds]}
            item-key="id"
            row-activation
            sort-by=${this.props.sortBy}
            sort-direction=${this.props.sortDirection}
            resizable
            sticky-header
            select-row-label=${() =>
                scalarText(this.selectEntryLabel).replaceAll(
                    '{entry}',
                    '{row}'
                )}
            deselect-row-label=${() =>
                scalarText(this.deselectEntryLabel).replaceAll(
                    '{entry}',
                    '{row}'
                )}
            sort-ascending-label=${this.props.sortAscendingLabel}
            sort-descending-label=${this.props.sortDescendingLabel}
            onbeforeselectionchange=${(
                event: CustomEvent<{ selectedKeys: readonly string[] }>
            ) => {
                event.stopPropagation()
                if (
                    !this.validSelection(
                        this.visibleSelection(event.detail.selectedKeys)
                    )
                ) {
                    event.preventDefault()
                }
            }}
            onselectionchange=${(
                event: CustomEvent<{ selectedKeys: readonly string[] }>
            ) => {
                event.stopPropagation()
                this.setSelection(
                    this.visibleSelection(event.detail.selectedKeys),
                    event
                )
            }}
            onrowactivate=${(event: CustomEvent<{ key: string }>) => {
                event.stopPropagation()
                const entry = this.visibleEntries().find(
                    (candidate) => candidate.id === event.detail.key
                )
                if (entry) this.activate(entry, event)
            }}
            onsortchange=${(
                event: CustomEvent<{
                    sortBy: FileBrowserSort
                    sortDirection: FileBrowserSortDirection
                }>
            ) => {
                event.stopPropagation()
                this.changeSort(
                    event.detail.sortBy,
                    event.detail.sortDirection,
                    event
                )
            }}
        ></cb-table>`

    private showSelectedFiles = (): boolean =>
        this.selectionMode !== 'none' && this.selectionCount > 0

    private selectionButtonLabel = (): string =>
        (scalarText(this.selectionCountLabel).trim() || '{count} selected')
            .replaceAll('{count}', String(this.selectionCount))
            .replaceAll('{max}', String(this.selectionLimit))

    private selectedListLabel = (): string =>
        scalarText(this.selectedFilesLabel).trim() || 'Selected files'

    private changeSelectedFiles(ids: readonly string[], event: Event): void {
        event.stopPropagation()
        if (!this.setSelection(ids, event)) return
        queueMicrotask(() => {
            const targets = this.selectionCount
                ? [...(this.refs.removeSelection ?? []), this.refs.selectionCount?.[0]]
                : [this.refs.search?.[0], this.refs.entries?.[0], this.refs.browser?.[0]]
            targets
                .find((target): target is HTMLElement =>
                    target instanceof HTMLElement && target.isConnected && !target.hidden
                )
                ?.focus()
        })
    }

    private selectionTemplate = (): Template =>
        html`<cb-popover
            part="selection"
            accessible-label=${this.selectedListLabel}
            popup-max-width="360px"
            popup-max-height="360px"
            disabled=${() => this.unavailable}
            onkeydown=${(event: KeyboardEvent) => {
                if (event.key !== 'Escape') return
                const trigger = this.refs.selectionCount?.[0]
                if (trigger instanceof HTMLElement) trigger.focus()
            }}
        >
            <cb-button
                ref="selectionCount"
                part="selection-count"
                slot="trigger"
                variant="secondary"
                size="sm"
                label=${this.selectionButtonLabel}
                disabled=${() => this.unavailable}
            ></cb-button>
            <cb-row
                part="selection-toolbar"
                gap="sm"
                align="center"
                justify="space-between"
            >
                <span role="status">${() => this.selectionSummary() || this.selectionButtonLabel()}</span>
                <cb-button
                    part="clear-selection"
                    label=${this.props.clearSelectionLabel}
                    size="xs"
                    variant="ghost"
                    hidden=${isNot(this.props.clearSelectionLabel)}
                    disabled=${() => this.unavailable}
                    onaction=${(event: Event) => this.changeSelectedFiles([], event)}
                ></cb-button>
            </cb-row>
            <cb-list part="selected-files" gap="xs" accessible-label=${this.selectedListLabel}>
                ${repeat(
                    this.selectedEntries,
                    (entry) =>
                        html`<cb-row
                            part="selected-file"
                            role="listitem"
                            align="center"
                            justify="space-between"
                            gap="sm"
                        >
                            <span part="selected-file-name" title=${entry.name}>${entry.name}</span>
                            <cb-button
                                ref="removeSelection"
                                part="remove-selection"
                                icon="close"
                                icon-only
                                variant="ghost"
                                size="xs"
                                accessible-label=${() =>
                                    (scalarText(this.removeSelectionLabel).trim() ||
                                        'Remove {entry}').replaceAll('{entry}', entry.name)}
                                disabled=${() => this.unavailable}
                                onaction=${(event: Event) =>
                                    this.changeSelectedFiles(
                                        this.selectedIds.filter((id) => id !== entry.id),
                                        event
                                    )}
                            ></cb-button>
                        </cb-row>`,
                    { key: (entry) => entry.id }
                )}
            </cb-list>
        </cb-popover>`

    private tableColumns = (): readonly TableColumn<FileRecord>[] => {
        const columns: TableColumn<FileRecord>[] = [
            {
                id: 'name',
                header: this.nameLabel,
                field: 'name',
                sortable: true,
                minWidth: 200,
                cell: (context) => {
                    const entry = this.entryForId(context.item.id)
                    return html`<span part="file-name">
                        <cb-icon
                            name=${entry?.icon || (context.item.type === 'folder' ? 'folder' : 'file')}
                            part="icon"
                            decorative
                        ></cb-icon>
                        ${context.item.name}
                    </span>`
                },
            },
            {
                id: 'type',
                header: this.typeLabel,
                field: 'type',
                sortable: true,
                width: 120,
            },
            {
                id: 'size',
                header: this.sizeLabel,
                field: 'size',
                sortable: true,
                align: 'end',
                width: 120,
            },
            {
                id: 'modified',
                header: this.modifiedLabel,
                field: 'modified',
                sortable: true,
                width: 160,
            },
        ]

        if (
            this.visibleEntries().some(
                (entry) => this.entryActions(entry).length > 0
            )
        ) {
            columns.push({
                id: 'actions',
                header: '',
                ariaLabel: this.actionMenuLabel,
                width: 48,
                cell: (context) => {
                    const entry = this.entryForId(context.item.id)
                    if (!entry || !this.entryActions(entry).length) return ''
                    return html`<cb-dropdown
                        part="table-actions"
                        icon="more"
                        icon-only
                        size="sm"
                        label=${this.props.actionMenuLabel}
                        items=${() => this.entryActions(entry)}
                        onchange=${(event: CustomEvent<ActionChangeDetail>) => {
                            event.stopPropagation()
                            this.triggerAction(event.detail.item, entry, event)
                        }}
                    ></cb-dropdown>`
                },
            })
        }

        return columns
    }

    private entryForId(id: string): FileBrowserEntry | undefined {
        return this.visibleEntries().find((entry) => entry.id === id)
    }

    private engageEntry(entry: FileBrowserEntry, event: Event): void {
        if (entry.type === 'folder') {
            if (this.pendingFolderSelection)
                clearTimeout(this.pendingFolderSelection)
            this.pendingFolderSelection = setTimeout(() => {
                this.pendingFolderSelection = null
                if (this.entrySelectable(entry)) this.select(entry, event)
                else this.activate(entry, event)
            }, 220)
            return
        }
        if (this.entrySelectable(entry)) this.select(entry, event)
        else this.activate(entry, event)
    }

    private openEntry(entry: FileBrowserEntry, event: Event): void {
        if (this.pendingFolderSelection) {
            clearTimeout(this.pendingFolderSelection)
            this.pendingFolderSelection = null
        }
        this.activate(entry, event)
    }

    private entryActionLabel(
        entry: FileBrowserEntry,
        selected: boolean
    ): string {
        const template = this.entrySelectable(entry)
            ? selected
                ? this.deselectEntryLabel
                : this.selectEntryLabel
            : this.openEntryLabel
        return scalarText(template).replaceAll('{entry}', entry.name)
    }
}

export { FileBrowserBase }
export type {
    FileBrowserAction,
    FileBrowserActionDetail,
    FileBrowserActionScope,
    FileBrowserEntry,
    FileBrowserPathItem,
    FileBrowserProps,
    FileBrowserSelectionMode,
    FileBrowserSort,
    FileBrowserSortDirection,
    FileBrowserView,
} from './FileBrowserBase.js'

register('cb-file-browser', FileBrowser)
