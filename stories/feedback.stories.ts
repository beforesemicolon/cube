import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/feedback/index.js'

const meta: Meta = { title: 'Feedback', tags: ['autodocs'], parameters: { docs: { description: { component: 'Feedback components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Status: Story = componentStory('cb-status', { label: 'Status', value: 'Ready', status: 'Updated' })

export const EmptyState: Story = componentStory('cb-empty-state', { label: 'Empty state', value: 'Ready', status: 'Updated' })

export const Skeleton: Story = componentStory('cb-skeleton', { label: 'Skeleton', value: 'Ready', status: 'Updated' })

export const Progress: Story = componentStory('cb-progress', { label: 'Progress', progress: 64, max: 100, status: '64%' })

export const Spinner: Story = componentStory('cb-spinner', { label: 'Spinner', progress: 64, max: 100, status: '64%' })

export const Toast: Story = componentStory('cb-toast', { label: 'Toast', value: 'Ready', status: 'Updated' })

export const Alert: Story = componentStory('cb-alert', { label: 'Alert', value: 'Ready', status: 'Updated' })

export const Banner: Story = componentStory('cb-banner', { label: 'Banner', value: 'Ready', status: 'Updated' })

export const Flashbar: Story = componentStory('cb-flashbar', { accessibleLabel: 'Notifications', position: 'top-end', maxVisible: 4, messages: [{ id: 'saved', type: 'success', heading: 'Changes saved', message: 'Your project is up to date.', dismissLabel: 'Dismiss', dismissible: true, duration: 0 }] })
