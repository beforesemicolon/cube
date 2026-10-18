import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { AccordionItem } from '../components/data-display/accordion/base.js'
import type { TableColumn, TableRecord } from '../components/data-display/table/base.js'
import { createFlashbar, configureFlashbarHost } from '../components/feedback/flashbar/service.js'
import { showModal } from '../components/overlay/modal/service.js'
import '../components/client.js'

const meta: Meta = {
    title: 'Examples',
    parameters: { docs: { description: { component: 'Application-level compositions built from Cube components. These are examples, not additional custom elements.' } } },
}
export default meta
type Story = StoryObj

const lengthUnits = [{ value: 'px', label: 'px' }, { value: '%', label: '%' }, { value: 'rem', label: 'rem' }, { value: 'vw', label: 'vw' }]
const lengthUnitProps = { unit: 'px', units: lengthUnits, unitLabel: 'Unit' }

type SurfaceSize = 'compact' | 'standard' | 'wide'
type ComponentValue = string | number | boolean | readonly (string | object)[]
type ComponentProps = Record<string, ComponentValue>

const fieldOwnedProperties = new Set([
    'label', 'accessibleLabel', 'description', 'helpText', 'details', 'detailsLabel', 'optionalLabel',
    'error', 'errorText', 'success', 'successText', 'disabled', 'required', 'invalid',
])

function sizedSurface(size: SurfaceSize, ...children: HTMLElement[]): HTMLElement {
    const node = document.createElement('div')
    const widths: Readonly<Record<SurfaceSize, string>> = { compact: '440px', standard: '720px', wide: '1120px' }
    node.dataset.exampleSurface = size
    node.style.cssText = `position:relative;display:grid;align-content:start;justify-items:start;gap:16px;inline-size:min(100%,${widths[size]});max-inline-size:100%;box-sizing:border-box;padding:clamp(16px,4vw,24px);border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-surface);color:var(--color-foreground);box-shadow:var(--shadow-sm,0 1px 2px color-mix(in srgb,var(--color-foreground) 8%,transparent));overflow:visible`
    for (const child of children) child.style.maxInlineSize = '100%'
    node.append(...children)
    return node
}

function surface(...children: HTMLElement[]): HTMLElement { return sizedSurface('standard', ...children) }
function compactSurface(...children: HTMLElement[]): HTMLElement { return sizedSurface('compact', ...children) }
function wideSurface(...children: HTMLElement[]): HTMLElement { return sizedSurface('wide', ...children) }
function fill<T extends HTMLElement>(node: T): T {
    node.setAttribute('inline-size', '100%')
    node.style.inlineSize = '100%'
    return node
}

function component<T extends HTMLElement>(tag: string, props: ComponentProps): T {
    const node = document.createElement(tag) as T
    node.style.maxInlineSize = '100%'
    Object.assign(node, props)
    return node
}

function formField(tag: string, props: ComponentProps): HTMLElement {
    const controlProps = Object.fromEntries(Object.entries(props).filter(([name]) => !fieldOwnedProperties.has(name))) as ComponentProps
    const control = component(tag, controlProps)
    const field = document.createElement('cb-field')
    const stringProp = (name: string): string => typeof props[name] === 'string' ? String(props[name]) : ''
    const errorText = stringProp('errorText') || stringProp('error')
    Object.assign(field, {
        label: stringProp('label'),
        accessibleLabel: stringProp('accessibleLabel'),
        description: stringProp('description'),
        helpText: stringProp('helpText'),
        details: stringProp('details'),
        detailsLabel: stringProp('detailsLabel'),
        optionalLabel: stringProp('optionalLabel'),
        errorText,
        successText: stringProp('successText'),
        disabled: props.disabled === true,
        required: props.required === true,
        invalid: props.invalid === true || Boolean(errorText),
        success: props.success === true,
    })
    field.style.maxInlineSize = '100%'
    field.append(control)
    return field
}

export const ButtonPressedStates: Story = {
    name: 'Action / Button pressed states',
    render: () => {
        const row = component('cb-row', { gap: '8px', wrap: true })
        row.append(
            component('cb-button', { label: 'Bold', pressed: false, variant: 'secondary' }),
            component('cb-button', { label: 'Preview', pressed: true, variant: 'primary' }),
            component('cb-button', { label: 'Outline guides', pressed: true, variant: 'outline' }),
            component('cb-button', { label: 'Snap to grid', pressed: true, variant: 'ghost' }),
            component('cb-button', { label: 'Block publishing', pressed: true, variant: 'destructive' }),
        )
        return compactSurface(row)
    },
}

export const MultiSelection: Story = {
    name: 'Form / Multi-selection',
    render: () => compactSurface(formField('cb-select', {
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
    render: () => compactSurface(formField('cb-combobox', { label: 'Add a command', placeholder: 'Start typing…', autocomplete: 'both', options: [{ value: 'layout', label: 'Auto layout' }, { value: 'width', label: 'Auto width' }, { value: 'save', label: 'Autosave' }] })),
}

export const NativeFormControls: Story = {
    name: 'Form / Native controls',
    render: () => compactSurface(
        formField('cb-select', { label: 'Device', native: true, value: 'desktop', options: [{ value: 'desktop', label: 'Desktop' }, { value: 'tablet', label: 'Tablet' }] }),
        formField('cb-date-picker', { label: 'Publish date', native: true, value: '2026-10-18' }),
        formField('cb-time-picker', { label: 'Publish time', native: true, value: '09:30' }),
    ),
}

export const Dimensions: Story = {
    name: 'Form / Dimensions',
    render: () => {
        const row = component('cb-row', { gap: '12px', wrap: true })
        row.append(
            formField('cb-unit-input', { label: 'Width', value: 320, ...lengthUnitProps }),
            formField('cb-unit-input', { label: 'Height', value: 180, ...lengthUnitProps }),
            formField('cb-text-input', { label: 'Aspect ratio', value: '16 : 9' }),
            formField('cb-number-input', { label: 'Z index', value: 10 }),
        )
        return surface(fill(row))
    },
}

export const FieldStates: Story = {
    name: 'Form / Field states',
    render: () => compactSurface(
        formField('cb-text-input', { label: 'Default', placeholder: 'Type a value' }),
        formField('cb-text-input', { label: 'Filled', value: 'Hero section' }),
        formField('cb-text-input', { label: 'Invalid', value: '!', invalid: true, error: 'Enter a descriptive name.' }),
        formField('cb-text-input', { label: 'Read only', value: 'Published', readOnly: true }),
        formField('cb-text-input', { label: 'Disabled', value: 'Unavailable', disabled: true }),
    ),
}

export const InputMasks: Story = {
    name: 'Form / Input mask patterns',
    render: () => compactSurface(
        formField('cb-masked-input', {
            label: 'US phone number', description: '9 accepts digits. Display: (617) 555-0142; submitted value: 6175550142.',
            value: '6175550142', mask: '(999) 999-9999', maskPlaceholder: '•', guide: true, unmask: true, inputMode: 'tel',
        }),
        formField('cb-masked-input', {
            label: 'Project code', description: 'A accepts letters and 9 accepts digits.',
            value: 'CUBE2048', mask: 'AAAA-9999', maskPlaceholder: '•', guide: true,
        }),
        formField('cb-masked-input', {
            label: 'Device key', description: '* accepts either a letter or a digit.',
            value: 'A7X92Q4LM', mask: '***-***-***', maskPlaceholder: '•', guide: true,
        }),
    ),
}

export const BoxModel: Story = {
    name: 'Layout / Box model',
    render: () => {
        const inputs = component('cb-grid', { columns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '12px' })
        inputs.append(
            formField('cb-unit-input', { label: 'Padding block', value: 24, ...lengthUnitProps }),
            formField('cb-unit-input', { label: 'Padding inline', value: 32, ...lengthUnitProps }),
            formField('cb-unit-input', { label: 'Margin block', value: 0, ...lengthUnitProps }),
            formField('cb-unit-input', { label: 'Margin inline', value: 0, ...lengthUnitProps }),
        )
        return surface(fill(inputs))
    },
}

export const LayoutControls: Story = {
    name: 'Layout / Flex controls',
    render: () => surface(
        fill(component('cb-segmented-control', { label: 'Direction', accessibleLabel: 'Flex direction', value: 'row', items: [{ id: 'row', label: 'Row' }, { id: 'column', label: 'Column' }] })),
        fill(component('cb-segmented-control', { label: 'Alignment', accessibleLabel: 'Alignment', value: 'center', items: [{ id: 'start', label: 'Start' }, { id: 'center', label: 'Center' }, { id: 'end', label: 'End' }] })),
        formField('cb-unit-input', { label: 'Gap', value: 16, ...lengthUnitProps }),
        component('cb-switch', { label: 'Wrap children', checked: true }),
    ),
}

export const StylingControls: Story = {
    name: 'Styling / Appearance controls',
    render: () => compactSurface(
        formField('cb-color-picker', { label: 'Fill', value: '#2563eb' }),
        formField('cb-range-slider', { label: 'Opacity', value: 84, min: 0, max: 100, step: 1 }),
        formField('cb-select', { label: 'Blend mode', value: 'normal', options: [{ value: 'normal', label: 'Normal' }, { value: 'multiply', label: 'Multiply' }, { value: 'screen', label: 'Screen' }] }),
        formField('cb-unit-input', { label: 'Corner radius', value: 12, ...lengthUnitProps }),
    ),
}

export const TypographyControls: Story = {
    name: 'Styling / Typography controls',
    render: () => surface(
        formField('cb-combobox', { label: 'Font family', value: 'inter', options: [{ value: 'inter', label: 'Inter' }, { value: 'source', label: 'Source Sans 3' }, { value: 'system', label: 'System UI' }] }),
        formField('cb-select', { label: 'Weight', value: '600', options: [{ value: '400', label: 'Regular' }, { value: '600', label: 'Semibold' }, { value: '700', label: 'Bold' }] }),
        formField('cb-unit-input', { label: 'Font size', value: 16, ...lengthUnitProps }),
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
            formField('cb-number-input', { label: 'Gap', value: 16, min: 0 }),
            formField('cb-select', { label: 'Overflow', options: [{ value: 'visible', label: 'Visible' }, { value: 'hidden', label: 'Hidden' }, { value: 'auto', label: 'Auto' }], value: 'visible' }),
        )
        panel.append(content)
        return compactSurface(fill(panel))
    },
}

export const AssetBrowser: Story = {
    name: 'Data display / Asset browser',
    render: () => {
        const assets = component('cb-grid', { columns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', gap: '12px' })
        for (const [label, value] of [['Hero image', '1920 × 1080'], ['Logo', 'SVG'], ['Portrait', '800 × 800']]) {
            assets.append(component('cb-card', { label, value, items: [{ id: 'metadata', label: 'Format', description: value }] }))
        }
        return wideSurface(formField('cb-combobox', { label: 'Search assets', placeholder: 'Name or type', options: [{ value: 'hero', label: 'Hero image' }, { value: 'logo', label: 'Logo' }] }), fill(assets))
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
        return wideSurface(fill(table))
    },
}

export const SettingsAccordion: Story = {
    name: 'Data display / Settings accordion',
    render: () => {
        const content = component('cb-col', { gap: '12px' })
        content.append(
            formField('cb-text-input', { label: 'Element ID', value: 'hero-section' }),
            formField('cb-text-input', { label: 'CSS classes', placeholder: 'Add space-separated classes' }),
            component('cb-switch', { label: 'Hide on smaller screens', checked: false }),
        )
        const appearance = component('cb-col', { gap: '12px' })
        appearance.append(
            formField('cb-select', { label: 'Surface', value: 'default', options: [{ value: 'default', label: 'Default' }, { value: 'muted', label: 'Muted' }, { value: 'raised', label: 'Raised' }] }),
            formField('cb-unit-input', { label: 'Corner radius', value: 8, ...lengthUnitProps }),
        )
        const accordion = document.createElement('cb-accordion') as HTMLElement & {
            items: readonly AccordionItem[]
            expandedIds: readonly string[]
        }
        Object.assign(accordion, {
            label: 'Element settings',
            variant: 'container',
            expandedIds: ['attributes'],
            items: [
                { id: 'attributes', label: 'Custom attributes', description: 'IDs, classes, and responsive visibility', renderContent: () => content, actions: [{ id: 'reset', label: 'Reset attributes', icon: 'reset' }] },
                { id: 'appearance', label: 'Appearance', description: 'Surface and corner treatment', renderContent: () => appearance },
                { id: 'advanced', label: 'Advanced rendering', disabled: true, disabledReason: 'Unavailable for this element type' },
            ] satisfies readonly AccordionItem[],
        })
        return surface(fill(accordion))
    },
}

export const CanvasSelection: Story = {
    name: 'Editor / Canvas selection',
    render: () => wideSurface(
        component('cb-artboard', { label: 'Homepage artboard', accessibleLabel: 'Homepage artboard' }),
        fill(component('cb-action-bar', { status: '3 layers selected', items: [{ id: 'group', label: 'Group' }, { id: 'duplicate', label: 'Duplicate' }, { id: 'delete', label: 'Delete' }] })),
    ),
}

export const PublishFlow: Story = {
    name: 'Overlay / Publish flow',
    render: () => {
        const launcher = component('cb-button', { label: 'Publish website', variant: 'primary' })
        const modal = component<HTMLElement & { show(): boolean }>('cb-modal', { heading: 'Publish website', description: 'Choose where this version should be available.' })
        const form = component('cb-col', { gap: '12px' })
        form.append(
            formField('cb-select', { label: 'Environment', value: 'production', options: [{ value: 'preview', label: 'Preview' }, { value: 'production', label: 'Production' }] }),
            component('cb-switch', { label: 'Notify collaborators', checked: true }),
        )
        modal.append(form)
        const footer = component('cb-row', { gap: '8px', justify: 'end' }); footer.slot = 'footer'
        footer.append(component('cb-button', { label: 'Cancel' }), component('cb-button', { label: 'Publish', variant: 'primary' }))
        modal.append(footer)
        launcher.addEventListener('cb-action', () => modal.show())
        return compactSurface(launcher, modal)
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
        return compactSurface(component('cb-alert', { label: 'Spacing change', value: '32 px → 24 px', status: 'Suggested by Ana' }), actions)
    },
}

export const EditorWorkspace: Story = {
    name: 'Layout / Complete editor workspace',
    render: () => {
        const workspace = document.createElement('cb-workspace') as HTMLElement & { startOpen: boolean; endOpen: boolean; bottomOpen: boolean }
        Object.assign(workspace, {
            label: 'Page editor', accessibleLabel: 'Page editor workspace', startOpen: true, endOpen: true, bottomOpen: true,
            startSize: 230, endSize: 300, bottomSize: 150, startLabel: 'Layers', endLabel: 'Properties', bottomLabel: 'Timeline',
            openStartLabel: 'Open layers', closeStartLabel: 'Close layers', openEndLabel: 'Open properties', closeEndLabel: 'Close properties',
            openBottomLabel: 'Open timeline', closeBottomLabel: 'Close timeline', closeMobileLabel: 'Close panel',
        })
        workspace.style.cssText = 'inline-size:100%;block-size:640px'
        const header = component('cb-toolbar', { label: 'Editor tools', items: [{ id: 'select', label: 'Select', icon: 'cursor' }, { id: 'preview', label: 'Preview', icon: 'eye' }] }); header.slot = 'header'
        const layers = component('cb-layer-tree', {
            label: 'Layers', accessibleLabel: 'Page layers', expandedIds: ['page', 'hero'], selectedIds: ['title'],
            expandLabel: 'Expand {item}', collapseLabel: 'Collapse {item}', showLabel: 'Show {item}', hideLabel: 'Hide {item}',
            lockLabel: 'Lock {item}', unlockLabel: 'Unlock {item}', renameLabel: 'Rename {item}', saveLabel: 'Save name', cancelLabel: 'Cancel', moveLabel: 'Move {item}',
            items: [{ id: 'page', label: 'Homepage', children: [{ id: 'hero', label: 'Hero', children: [{ id: 'title', label: 'Main heading', icon: 'text' }, { id: 'visual', label: 'Product visual', icon: 'image' }] }, { id: 'features', label: 'Features', icon: 'grid' }] }],
        }); layers.slot = 'start'
        const properties = component('cb-property-group', { label: 'Dimensions', expanded: true, dirty: true, resetLabel: 'Reset dimensions', mixedLabel: 'Mixed', expandLabel: 'Expand dimensions', collapseLabel: 'Collapse dimensions' }); properties.slot = 'end'
        const linked = formField('cb-linked-values', { label: 'Dimensions', accessibleLabel: 'Layer dimensions', firstValue: 320, secondValue: 180, firstLabel: 'Width', secondLabel: 'Height', linked: true, linkLabel: 'Link dimensions', unlinkLabel: 'Unlink dimensions' })
        properties.append(linked)
        const timeline = component('cb-timeline', { label: 'Timeline', accessibleLabel: 'Animation timeline', duration: 4, currentTime: 1, playLabel: 'Play', pauseLabel: 'Pause', rewindLabel: 'Rewind', addKeyframeLabel: 'Add keyframe', playheadLabel: 'Playhead', keyframeLabel: '{track} at {time}', timeLabel: '{current} / {duration}', tracks: [{ id: 'opacity', label: 'Opacity', keyframes: [{ id: 'one', time: 0 }, { id: 'two', time: 2 }, { id: 'three', time: 4 }] }] }); timeline.slot = 'bottom'
        const canvas = document.createElement('div')
        canvas.style.cssText = 'position:relative;min-block-size:100%;background:linear-gradient(90deg,var(--color-separator) 1px,transparent 1px),linear-gradient(var(--color-separator) 1px,transparent 1px);background-size:20px 20px'
        const artboard = component('cb-artboard', { label: 'Homepage', accessibleLabel: 'Homepage artboard', width: 640, height: 420, selected: true, dimensionsLabel: '{width} × {height}' })
        canvas.append(artboard)
        workspace.append(header, layers, canvas, properties, timeline)
        return wideSurface(workspace)
    },
}

export const GlobalModalSystem: Story = {
    name: 'Overlay / Global modal service',
    render: () => {
        const result = document.createElement('p')
        result.style.cssText = 'margin:0;color:var(--color-muted-foreground)'
        result.textContent = 'Open the modal and complete an action.'
        const launcher = component('cb-button', { label: 'Create project', variant: 'primary' })
        launcher.addEventListener('cb-action', async () => {
            const body = component('cb-col', { gap: '12px' })
            body.append(
                formField('cb-text-input', { label: 'Project name', value: 'Cube documentation' }),
                formField('cb-select', { label: 'Visibility', value: 'team', options: [{ value: 'private', label: 'Private' }, { value: 'team', label: 'Project members' }, { value: 'public', label: 'Public' }] }),
            )
            const handle = showModal({
                id: 'storybook-create-project', heading: 'Create project', description: 'Set the initial project details.', body,
                cancelLabel: 'Cancel', actions: [{ id: 'create', label: 'Create project', value: 'created', variant: 'primary', onAction: async () => Promise.resolve() }],
            })
            const modalResult = await handle
            result.textContent = modalResult.reason === 'action' ? 'Project created.' : `Modal closed: ${modalResult.reason}.`
        })
        return compactSurface(launcher, result)
    },
}

export const GlobalFlashbarSystem: Story = {
    name: 'Feedback / Global flashbar service',
    render: () => {
        const root = compactSurface()
        configureFlashbarHost({ parent: root, accessibleLabel: 'Application notifications', position: 'top-end', maxVisible: 3 })
        const actions = component('cb-row', { gap: '8px', wrap: true })
        const save = component('cb-button', { label: 'Show success', variant: 'primary' })
        const retry = component('cb-button', { label: 'Show retry action' })
        save.addEventListener('cb-action', () => createFlashbar({ id: 'saved-example', type: 'success', heading: 'Changes saved', message: 'The project is up to date.', dismissible: true, dismissLabel: 'Dismiss changes saved' }))
        retry.addEventListener('cb-action', () => {
            const handle = createFlashbar({
                id: 'retry-example', type: 'error', heading: 'Publish failed', message: 'Check the connection and try again.',
                actionLabel: 'Retry publish', dismissOnAction: false, dismissible: true, dismissLabel: 'Dismiss publish error',
                action: async () => { handle.update({ type: 'loading', heading: 'Publishing', message: 'Trying again…', actionLabel: '' }) },
            })
        })
        actions.append(save, retry)
        root.append(actions)
        return root
    },
}
