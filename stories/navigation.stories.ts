import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import { html } from '../components/core/runtime.js'
import type { NormalizedItem } from '../components/core/items.js'
import './setup.js'

const meta: Meta = { title: 'Navigation', tags: ['autodocs'], parameters: { docs: { description: { component: 'Navigation components with headless bases, themed parts, category initialization and browser clients.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]
const segmentedItems = [
    { id: 'one', label: 'Grid view', icon: 'grid' },
    { id: 'two', label: 'Table view', icon: 'table' },
    { id: 'three', label: 'List view', icon: 'list', disabled: true },
]

export const SegmentedControl: Story = componentStory('cb-segmented-control', { label: 'View', value: 'one', items: segmentedItems, stacked: false })

export const Tabs: Story = componentStory('cb-tabs', { label: 'Workspace', value: 'one', items, stacked: false, activation: 'automatic' })

export const Breadcrumb: Story = componentStory('cb-breadcrumb', { label: 'Breadcrumb', items, maxItems: 4, expandLabel: 'Show all breadcrumbs' })

export const Menu: Story = componentStory('cb-menu', {
    label: 'Menu',
    items: [
        { id: 'one', label: 'Primary item', icon: 'file' },
        { id: 'two', label: 'Secondary item', icon: 'settings' },
        { id: 'three', label: 'Disabled item', icon: 'lock', disabled: true },
        { id: 'custom', label: 'Custom item', renderItem: (item: NormalizedItem) => html`<cb-row gap="sm" padding="sm"><cb-icon name="file"></cb-icon><strong>${item.label}</strong><cb-badge label="New"></cb-badge></cb-row>` },
    ],
    loop: true,
    gap: '1px',
    active: 'one',
    variant: 'both',
})

export const Link: Story = componentStory('cb-link', { label: 'Documentation', href: '#documentation', target: '_self', variant: 'primary' })

export const Pagination: Story = componentStory('cb-pagination', { label: 'Results pages', page: 2, totalPages: 8, siblings: 1, previousLabel: 'Previous page', nextLabel: 'Next page', pageLabel: 'Page {page}' })
