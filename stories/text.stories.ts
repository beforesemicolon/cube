import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/text/index.js'

const meta: Meta = { title: 'Text', tags: ['autodocs'], parameters: { docs: { description: { component: 'Semantic text components and compact textual notation.' } } } }
export default meta
type Story = StoryObj

export const Heading: Story = componentStory('cb-heading', { label: 'Design system', description: 'Build consistent interfaces from shared components.', variant: 'h2', size: 'lg' })
export const Shortcut: Story = componentStory('cb-shortcut', { keys: '⌘+Shift+P', accessibleLabel: 'Command Shift P' })
