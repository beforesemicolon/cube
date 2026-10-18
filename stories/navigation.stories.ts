import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/navigation/index.js'

const meta: Meta = { title: 'Navigation', tags: ['autodocs'], parameters: { docs: { description: { component: 'Navigation components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const SegmentedControl: Story = componentStory('cb-segmented-control', { label: 'View', value: 'one', items, orientation: 'horizontal' })

export const Tabs: Story = componentStory('cb-tabs', { label: 'Workspace', value: 'one', items, orientation: 'horizontal', activation: 'automatic' })

export const Breadcrumb: Story = componentStory('cb-breadcrumb', { label: 'Breadcrumb', items, maxItems: 4 })

export const Menu: Story = componentStory('cb-menu', { label: 'Menu', items, loop: true })

export const Link: Story = componentStory('cb-link', { label: 'Documentation', href: '#documentation', target: '_self', variant: 'ghost' })

export const Pagination: Story = componentStory('cb-pagination', { label: 'Results pages', page: 2, totalPages: 8, siblings: 1 })
