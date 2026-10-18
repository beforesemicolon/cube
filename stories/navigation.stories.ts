import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/navigation/index.js'

const meta: Meta = { title: 'Navigation', tags: ['autodocs'], parameters: { docs: { description: { component: 'Navigation components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const SegmentedControl: Story = { args: { label: 'Segmented control', value: 'one', items }, render: (args, context) => preview('cb-segmented-control', args, context.globals.appearance) }

export const Tabs: Story = { args: { label: 'Tabs', value: 'one', items }, render: (args, context) => preview('cb-tabs', args, context.globals.appearance) }

export const Breadcrumb: Story = { args: { label: 'Breadcrumb', value: 'one', items }, render: (args, context) => preview('cb-breadcrumb', args, context.globals.appearance) }

export const Menu: Story = { args: { label: 'Menu', value: 'one', items }, render: (args, context) => preview('cb-menu', args, context.globals.appearance) }

export const Link: Story = { args: { label: 'Link', value: '12 px', placeholder: 'Link' }, render: (args, context) => preview('cb-link', args, context.globals.appearance) }

export const Pagination: Story = { args: { label: 'Pagination', value: 24, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-pagination', args, context.globals.appearance) }
