import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/feedback/index.js'

const meta: Meta = { title: 'Feedback', tags: ['autodocs'], parameters: { docs: { description: { component: 'Feedback components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Status: Story = { args: { label: 'Status', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-status', args, context.globals.appearance) }

export const EmptyState: Story = { args: { label: 'Empty state', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-empty-state', args, context.globals.appearance) }

export const Skeleton: Story = { args: { label: 'Skeleton', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-skeleton', args, context.globals.appearance) }

export const Progress: Story = { args: { label: 'Progress', progress: 64, max: 100, status: '64%' }, render: (args, context) => preview('cb-progress', args, context.globals.appearance) }

export const Spinner: Story = { args: { label: 'Spinner', progress: 64, max: 100, status: '64%' }, render: (args, context) => preview('cb-spinner', args, context.globals.appearance) }

export const Toast: Story = { args: { label: 'Toast', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-toast', args, context.globals.appearance) }

export const Alert: Story = { args: { label: 'Alert', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-alert', args, context.globals.appearance) }

export const Banner: Story = { args: { label: 'Banner', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-banner', args, context.globals.appearance) }

export const Flashbar: Story = { args: { label: 'Flashbar', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-flashbar', args, context.globals.appearance) }
