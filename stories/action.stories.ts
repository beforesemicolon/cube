import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/action/index.js'

const meta: Meta = { title: 'Action', tags: ['autodocs'], parameters: { docs: { description: { component: 'Action components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Button: Story = componentStory('cb-button', { label: 'Button', value: 'add-section', variant: 'primary', icon: 'plus', loading: false })

export const ButtonIcon: Story = componentStory('cb-button', { label: 'Settings', accessibleLabel: 'Settings', value: 'settings', variant: 'secondary', icon: 'settings', iconOnly: true, loading: false })

export const SplitButton: Story = componentStory('cb-split-button', { label: 'Split button', value: 'create', items, open: false, placement: 'bottom-start', loading: false })

export const ButtonGroup: Story = componentStory('cb-button-group', { label: 'Clipboard actions', variant: 'secondary', items: [{ id: 'copy', label: 'Copy' }, { id: 'paste', label: 'Paste' }, { id: 'duplicate', label: 'Duplicate' }] })

export const Toolbar: Story = componentStory('cb-toolbar', { label: 'Toolbar' })

export const ActionBar: Story = componentStory('cb-action-bar', { label: 'Action bar' })
