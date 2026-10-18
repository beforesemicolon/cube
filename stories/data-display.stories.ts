import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/data-display/index.js'

const meta: Meta = { title: 'Data display', tags: ['autodocs'], parameters: { docs: { description: { component: 'Data display components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]
const tableItems = [
    { id: 'website', parentId: '', name: 'Marketing website', status: 'Published', owner: 'Maya Chen', updated: 'Oct 18, 2026', selectable: true },
    { id: 'home', parentId: 'website', name: 'Home page', status: 'Published', owner: 'Maya Chen', updated: 'Oct 18, 2026', selectable: true },
    { id: 'pricing', parentId: 'website', name: 'Pricing page', status: 'Draft', owner: 'Noah Williams', updated: 'Oct 17, 2026', selectable: true },
    { id: 'design-system', parentId: '', name: 'Design system', status: 'In review', owner: 'Sofia Martins', updated: 'Oct 16, 2026', selectable: true },
    { id: 'archive', parentId: '', name: 'Archived campaign', status: 'Archived', owner: 'Liam Okafor', updated: 'Sep 29, 2026', selectable: false },
]
const tableColumns = [
    { id: 'name', header: 'Name', field: 'name', sortable: true, minWidth: 220 },
    { id: 'status', header: 'Status', field: 'status', sortable: true, width: 128 },
    { id: 'owner', header: 'Owner', field: 'owner', sortable: true, minWidth: 160 },
    { id: 'updated', header: 'Updated', field: 'updated', sortable: true, minWidth: 140 },
]

export const Badge: Story = componentStory('cb-badge', { label: 'Badge', value: 'Example', status: 'Ready' })

export const Avatar: Story = componentStory('cb-avatar', { label: 'Avatar', value: 'Example', status: 'Ready' })

export const Card: Story = componentStory('cb-card', { label: 'Card', actionLabel: 'Open', expanded: true })

export const List: Story = componentStory('cb-list', { label: 'List', value: 'one', items, emptyLabel: 'No items' })

export const DescriptionRow: Story = componentStory('cb-description-row', { label: 'Description row', value: 'Example', status: 'Ready' })

export const Table: Story = componentStory('cb-table', {
    label: 'Project resources',
    items: tableItems,
    columns: tableColumns,
    itemKey: 'id',
    parentBy: 'parentId',
    expandedKeys: ['website'],
    selectionMode: 'multiple',
    selectedKeys: ['home'],
    selectableField: 'selectable',
    sortBy: 'name',
    sortDirection: 'asc',
    rowActivation: true,
    resizable: true,
    stickyHeader: true,
    stickyColumns: 1,
    striped: false,
    density: 'comfortable',
    emptyLabel: 'No project resources',
    loadingLabel: 'Loading project resources',
    selectAllLabel: 'Select all visible rows',
    deselectAllLabel: 'Deselect all visible rows',
    selectRowLabel: 'Select {row}',
    deselectRowLabel: 'Deselect {row}',
    expandRowLabel: 'Expand {row}',
    collapseRowLabel: 'Collapse {row}',
    expandGroupLabel: 'Expand {group}',
    collapseGroupLabel: 'Collapse {group}',
    sortAscendingLabel: 'Sort {column} ascending',
    sortDescendingLabel: 'Sort {column} descending',
    ascendingLabel: 'ascending',
    descendingLabel: 'descending',
    expandedLabel: 'expanded',
    collapsedLabel: 'collapsed',
    resizeColumnLabel: 'Resize {column} column',
    selectionAnnouncement: '{count} rows selected',
    sortAnnouncement: '{column} sorted {direction}',
    expansionAnnouncement: '{row} is {state}',
})

export const Tree: Story = componentStory('cb-tree', { label: 'Tree', value: 'one', items, emptyLabel: 'No items' })

export const Accordion: Story = componentStory('cb-accordion', {
    label: 'Accordion settings',
    items: [
        { id: 'advanced', label: 'Advanced settings', description: 'Optional controls for this element.', content: 'Custom attributes and rendering behavior.', actions: [{ id: 'edit', label: 'Open editor' }] },
        { id: 'appearance', label: 'Appearance', content: 'Theme, spacing, and responsive presentation.' },
        { id: 'unavailable', label: 'Element-specific controls', disabled: true, disabledReason: 'Unavailable for this element type' },
    ],
    expandedIds: ['advanced'],
    multiple: false,
    collapsible: true,
    animated: true,
    variant: 'simple',
    headingLevel: 3,
    emptyLabel: 'No settings available',
})

export const CodePreview: Story = componentStory('cb-code-preview', { label: 'Code preview', code: '<cb-button label="Save"></cb-button>', codeLanguage: 'html', copyLabel: 'Copy code', copiedLabel: 'Copied' })
