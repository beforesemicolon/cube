import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import './setup.js'

const meta: Meta = { title: 'Feedback', tags: ['autodocs'], parameters: { docs: { description: { component: 'Feedback components with headless bases, themed parts, category initialization and browser clients.' } } } }
export default meta
type Story = StoryObj

export const Status: Story = componentStory('cb-status', { label: 'Status', value: 'All changes saved', status: '', tone: 'success' })

export const EmptyState: Story = componentStory('cb-empty-state', { heading: 'Start with your first page', description: 'Build from a blank page or a saved template.', icon: 'plus' })

export const Skeleton: Story = componentStory('cb-skeleton', { variant: 'text', lines: 3, rows: 3, columns: 3, animated: true, accessibleLabel: 'Loading content' })

export const Progress: Story = componentStory('cb-progress', { label: 'Uploading assets', progress: 60, max: 100, status: '60%', tone: 'info' })

export const Spinner: Story = componentStory('cb-spinner', { label: 'Loading', status: 'Loading assets…', size: 'md' })

export const Toast: Story = componentStory('cb-toast', { label: 'Changes published', value: 'Your latest changes are available online.', status: '', tone: 'success' })

export const Alert: Story = componentStory('cb-alert', { label: 'Preview is not published', value: 'Only people with the preview link can see this version.', status: '', tone: 'info' })

export const Banner: Story = componentStory('cb-banner', { label: 'You are offline', value: 'Changes are saved on this device until you reconnect.', status: '', tone: 'warning' })

export const Flashbar: Story = componentStory('cb-flashbar', { accessibleLabel: 'Notifications', position: 'top-end', maxVisible: 4, messages: [{ id: 'saved', type: 'success', heading: 'Changes saved', message: 'Your project is up to date.', dismissLabel: 'Dismiss', dismissible: true, duration: 0 }] })
