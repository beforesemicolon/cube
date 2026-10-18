import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { TableColumn, TableRecord } from '../components/data-display/table/base.js'
import '../components/client.js'

const meta: Meta = { title: 'Examples', parameters: { docs: { description: { component: 'Application-level compositions built from Cube components. These are examples, not additional custom elements.' } } } }
export default meta
type Story = StoryObj

const lengthUnits = [{ value: 'px', label: 'px' }, { value: '%', label: '%' }, { value: 'rem', label: 'rem' }, { value: 'vw', label: 'vw' }]
const lengthUnitProps = { unit: 'px', units: lengthUnits, unitLabel: 'Unit' }

function surface(...children: HTMLElement[]): HTMLElement {
    const node = document.createElement('div')
    node.style.cssText = 'display:grid;gap:16px;max-width:720px;padding:24px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-surface);color:var(--color-foreground)'
    node.append(...children)
    return node
}

function component<T extends HTMLElement>(tag: string, props: Record<string, string | number | boolean | readonly (string | object)[]>): T {
    const node = document.createElement(tag) as T
    Object.assign(node, props)
    return node
}

export const MultiSelection: Story = {
    name: 'Form / Multi-selection',
    render: () => surface(component('cb-select', {
        label: 'Project members',
        placeholder: 'Choose members',
        multi: true,
        searchable: true,
        searchLabel: 'Filter project members',
        searchPlaceholder: 'Search members',
        emptyLabel: 'No matching members',
        value: ['maya'],
        options: [
            { value: 'maya', label: 'Maya Chen' },
            { value: 'noah', label: 'Noah Williams' },
            { value: 'sofia', label: 'Sofia Martins' },
            { value: 'liam', label: 'Liam Okafor' },
        ],
    })),
}

export const Autocomplete: Story = {
    name: 'Form / Autocomplete',
    render: () => surface(component('cb-combobox', { label: 'Add a command', placeholder: 'Start typing…', autocomplete: 'both', options: [{ value: 'layout', label: 'Auto layout' }, { value: 'width', label: 'Auto width' }, { value: 'save', label: 'Autosave' }] })),
}

export const NativeFormControls: Story = {
    name: 'Form / Native controls',
    render: () => surface(
        component('cb-select', { label: 'Device', native: true, value: 'desktop', options: [{ value: 'desktop', label: 'Desktop' }, { value: 'tablet', label: 'Tablet' }] }),
        component('cb-date-picker', { label: 'Publish date', native: true, value: '2026-10-18' }),
        component('cb-time-picker', { label: 'Publish time', native: true, value: '09:30' }),
    ),
}

export const Dimensions: Story = {
    name: 'Form / Dimensions',
    render: () => {
        const row = component('cb-row', { gap: '12px', wrap: true })
        row.append(
            component('cb-unit-input', { label: 'Width', value: 320, ...lengthUnitProps }),
            component('cb-unit-input', { label: 'Height', value: 180, ...lengthUnitProps }),
            component('cb-text-input', { label: 'Aspect ratio', value: '16 : 9' }),
            component('cb-number-input', { label: 'Z index', value: 10 }),
        )
        return surface(row)
    },
}

export const FieldStates: Story = {
    name: 'Form / Field states',
    render: () => surface(
        component('cb-text-input', { label: 'Default', placeholder: 'Type a value' }),
        component('cb-text-input', { label: 'Filled', value: 'Hero section' }),
        component('cb-text-input', { label: 'Invalid', value: '!', invalid: true, error: 'Enter a descriptive name.' }),
        component('cb-text-input', { label: 'Read only', value: 'Published', readOnly: true }),
        component('cb-text-input', { label: 'Disabled', value: 'Unavailable', disabled: true }),
    ),
}

export const BoxModel: Story = {
    name: 'Layout / Box model',
    render: () => {
        const inputs = component('cb-grid', { columns: 'repeat(2,minmax(0,1fr))', gap: '12px' })
        inputs.append(
            component('cb-unit-input', { label: 'Padding block', value: 24, ...lengthUnitProps }),
            component('cb-unit-input', { label: 'Padding inline', value: 32, ...lengthUnitProps }),
            component('cb-unit-input', { label: 'Margin block', value: 0, ...lengthUnitProps }),
            component('cb-unit-input', { label: 'Margin inline', value: 0, ...lengthUnitProps }),
        )
        return surface(inputs)
    },
}

export const LayoutControls: Story = {
    name: 'Layout / Flex controls',
    render: () => surface(
        component('cb-segmented-control', { label: 'Direction', accessibleLabel: 'Flex direction', value: 'row', items: [{ id: 'row', label: 'Row' }, { id: 'column', label: 'Column' }] }),
        component('cb-segmented-control', { label: 'Alignment', accessibleLabel: 'Alignment', value: 'center', items: [{ id: 'start', label: 'Start' }, { id: 'center', label: 'Center' }, { id: 'end', label: 'End' }] }),
        component('cb-unit-input', { label: 'Gap', value: 16, ...lengthUnitProps }),
        component('cb-switch', { label: 'Wrap children', checked: true }),
    ),
}

export const StylingControls: Story = {
    name: 'Styling / Appearance controls',
    render: () => surface(
        component('cb-color-picker', { label: 'Fill', value: '#2563eb' }),
        component('cb-range-slider', { label: 'Opacity', value: 84, min: 0, max: 100, step: 1 }),
        component('cb-select', { label: 'Blend mode', value: 'normal', options: [{ value: 'normal', label: 'Normal' }, { value: 'multiply', label: 'Multiply' }, { value: 'screen', label: 'Screen' }] }),
        component('cb-unit-input', { label: 'Corner radius', value: 12, ...lengthUnitProps }),
    ),
}

export const TypographyControls: Story = {
    name: 'Styling / Typography controls',
    render: () => surface(
        component('cb-combobox', { label: 'Font family', value: 'inter', options: [{ value: 'inter', label: 'Inter' }, { value: 'source', label: 'Source Sans 3' }, { value: 'system', label: 'System UI' }] }),
        component('cb-select', { label: 'Weight', value: '600', options: [{ value: '400', label: 'Regular' }, { value: '600', label: 'Semibold' }, { value: '700', label: 'Bold' }] }),
        component('cb-unit-input', { label: 'Font size', value: 16, ...lengthUnitProps }),
        component('cb-segmented-control', { label: 'Text alignment', value: 'left', items: [{ id: 'left', label: 'Left' }, { id: 'center', label: 'Center' }, { id: 'right', label: 'Right' }] }),
    ),
}

export const InspectorPanel: Story = {
    name: 'Layout / Inspector panel',
    render: () => {
        const panel = component('cb-docked-panel', { label: 'Layout' })
        const content = component('cb-col', { gap: '16px' })
        content.append(
            component('cb-segmented-control', { label: 'Direction', items: [{ id: 'row', label: 'Row' }, { id: 'column', label: 'Column' }], value: 'row' }),
            component('cb-number-input', { label: 'Gap', value: 16, min: 0 }),
            component('cb-select', { label: 'Overflow', options: [{ value: 'visible', label: 'Visible' }, { value: 'hidden', label: 'Hidden' }, { value: 'auto', label: 'Auto' }], value: 'visible' }),
        )
        panel.append(content)
        return surface(panel)
    },
}

export const AssetBrowser: Story = {
    name: 'Data display / Asset browser',
    render: () => {
        const assets = component('cb-grid', { columns: 'repeat(3,minmax(0,1fr))', gap: '12px' })
        for (const [label, value] of [['Hero image', '1920 × 1080'], ['Logo', 'SVG'], ['Portrait', '800 × 800']]) {
            assets.append(component('cb-card', { label, value, items: [{ id: 'metadata', label: 'Format', description: value }] }))
        }
        return surface(component('cb-combobox', { label: 'Search assets', placeholder: 'Name or type', options: [{ value: 'hero', label: 'Hero image' }, { value: 'logo', label: 'Logo' }] }), assets)
    },
}

export const ResourceTable: Story = {
    name: 'Data display / Rich resource table',
    render: () => {
        const rows: TableRecord[] = [
            { id: 'website', parentId: '', team: 'web', teamLabel: 'Web experience', name: 'Marketing website', status: 'Published', owner: 'Maya Chen', updated: 'Oct 18, 2026', selectable: true },
            { id: 'home', parentId: 'website', team: 'web', teamLabel: 'Web experience', name: 'Home page', status: 'Published', owner: 'Maya Chen', updated: 'Oct 18, 2026', selectable: true },
            { id: 'pricing', parentId: 'website', team: 'web', teamLabel: 'Web experience', name: 'Pricing page', status: 'Draft', owner: 'Noah Williams', updated: 'Oct 17, 2026', selectable: true },
            { id: 'tokens', parentId: '', team: 'system', teamLabel: 'Design system', name: 'Theme tokens', status: 'In review', owner: 'Sofia Martins', updated: 'Oct 16, 2026', selectable: true },
            { id: 'legacy', parentId: '', team: 'system', teamLabel: 'Design system', name: 'Legacy icons', status: 'Archived', owner: 'Liam Okafor', updated: 'Sep 29, 2026', selectable: false },
        ]
        const columns: TableColumn[] = [
            { id: 'name', header: 'Name', field: 'name', sortable: true, minWidth: 220, cell: ({ value }) => {
                const link = component('cb-link', { label: String(value ?? ''), href: '#resource' })
                return link
            } },
            {
                id: 'status', header: 'Status', field: 'status', sortable: true, width: 130,
                cell: ({ value }) => component('cb-badge', { value: String(value ?? '') }),
                cellVariant: ({ value }) => value === 'Published' ? 'success' : value === 'Archived' ? 'muted' : 'warning',
            },
            { id: 'owner', header: 'Owner', field: 'owner', sortable: true, minWidth: 160 },
            { id: 'updated', header: 'Updated', field: 'updated', sortable: true, minWidth: 140 },
            { id: 'actions', header: 'Actions', ariaLabel: 'Resource actions', width: 88, align: 'center', cell: ({ item }) => component('cb-icon-button', { icon: 'more', label: `Actions for ${String(item.name ?? '')}`, accessibleLabel: `Actions for ${String(item.name ?? '')}`, variant: 'ghost' }) },
        ]
        const table = document.createElement('cb-table') as HTMLElement & {
            items: readonly TableRecord[]
            columns: readonly TableColumn[]
            expandedKeys: readonly string[]
            selectedKeys: readonly string[]
        }
        Object.assign(table, {
            label: 'Project resources', items: rows, columns, itemKey: 'id', parentBy: 'parentId', expandedKeys: ['website'],
            groupBy: 'team', groupLabelBy: 'teamLabel', selectionMode: 'multiple', selectedKeys: ['home'], selectableField: 'selectable',
            sortBy: 'name', sortDirection: 'asc', rowActivation: true, resizable: true, stickyHeader: true, stickyColumns: 1,
            emptyLabel: 'No project resources', loadingLabel: 'Loading project resources', selectAllLabel: 'Select all visible rows',
            deselectAllLabel: 'Deselect all visible rows', selectRowLabel: 'Select {row}', deselectRowLabel: 'Deselect {row}',
            expandRowLabel: 'Expand {row}', collapseRowLabel: 'Collapse {row}', expandGroupLabel: 'Expand {group}',
            collapseGroupLabel: 'Collapse {group}', sortAscendingLabel: 'Sort {column} ascending', sortDescendingLabel: 'Sort {column} descending',
            ascendingLabel: 'ascending', descendingLabel: 'descending', expandedLabel: 'expanded', collapsedLabel: 'collapsed',
            resizeColumnLabel: 'Resize {column} column', selectionAnnouncement: '{count} rows selected',
            sortAnnouncement: '{column} sorted {direction}', expansionAnnouncement: '{row} is {state}',
        })
        const header = component('cb-row', { gap: '8px', justify: 'space-between', padding: '12px' })
        header.slot = 'header'
        const title = document.createElement('div')
        const heading = document.createElement('strong')
        const count = document.createElement('span')
        heading.textContent = 'Project resources'
        count.textContent = `${rows.length} resources`
        count.style.cssText = 'display:block;color:var(--color-muted-foreground);font-size:11px;margin-top:2px'
        title.append(heading, count)
        header.append(title, component('cb-button', { label: 'Create resource', variant: 'primary', icon: 'plus' }))
        table.append(header)
        return surface(table)
    },
}

export const CanvasSelection: Story = {
    name: 'Editor / Canvas selection',
    render: () => surface(
        component('cb-artboard', { label: 'Homepage artboard', accessibleLabel: 'Homepage artboard' }),
        component('cb-action-bar', { status: '3 layers selected', items: [{ id: 'group', label: 'Group' }, { id: 'duplicate', label: 'Duplicate' }, { id: 'delete', label: 'Delete' }] }),
    ),
}

export const PublishFlow: Story = {
    name: 'Overlay / Publish flow',
    render: () => {
        const launcher = component('cb-button', { label: 'Publish website', variant: 'primary' })
        const modal = component<HTMLElement & { show(): boolean }>('cb-modal', { heading: 'Publish website', description: 'Choose where this version should be available.' })
        const form = component('cb-col', { gap: '12px' })
        form.append(
            component('cb-select', { label: 'Environment', value: 'production', options: [{ value: 'preview', label: 'Preview' }, { value: 'production', label: 'Production' }] }),
            component('cb-switch', { label: 'Notify collaborators', checked: true }),
        )
        modal.append(form)
        const footer = component('cb-row', { gap: '8px', justify: 'end' }); footer.slot = 'footer'
        footer.append(component('cb-button', { label: 'Cancel' }), component('cb-button', { label: 'Publish', variant: 'primary' }))
        modal.append(footer)
        launcher.addEventListener('cb-action', () => modal.show())
        return surface(launcher, modal)
    },
}

export const FeedbackStates: Story = {
    name: 'Feedback / Async states',
    render: () => surface(
        component('cb-progress', { label: 'Uploading assets', progress: 64, max: 100, status: '64%' }),
        component('cb-alert', { label: 'Autosave paused', value: 'Reconnect to keep editing.', status: 'Offline' }),
        component('cb-empty-state', { label: 'No comments yet', value: 'Start a review to collect feedback.' }),
    ),
}

export const ReviewWorkflow: Story = {
    name: 'Collaboration / Review workflow',
    render: () => {
        const actions = component('cb-button-group', { label: 'Review actions', items: [{ id: 'reject', label: 'Reject' }, { id: 'approve', label: 'Approve' }] })
        return surface(component('cb-alert', { label: 'Spacing change', value: '32 px → 24 px', status: 'Suggested by Ana' }), actions)
    },
}
