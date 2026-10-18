import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/action/index.js'

const meta: Meta = { title: 'Action', tags: ['autodocs'], parameters: { docs: { description: { component: 'Action components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const FloatingToolbar: Story = { args: { label: 'Floating toolbar', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-floating-toolbar', args, context.globals.appearance) }

export const UndoRedo: Story = { args: { label: 'Undo redo', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-undo-redo', args, context.globals.appearance) }

export const Shortcuts: Story = { args: { label: 'Shortcuts', value: 'one', items }, render: (args, context) => preview('cb-shortcuts', args, context.globals.appearance) }

export const Button: Story = { args: { label: 'Button', value: '12 px', placeholder: 'Button' }, render: (args, context) => preview('cb-button', args, context.globals.appearance) }

export const IconButton: Story = { args: { label: 'Icon button', value: '12 px', placeholder: 'Icon button' }, render: (args, context) => preview('cb-icon-button', args, context.globals.appearance) }

export const SplitButton: Story = { args: { label: 'Split button', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-split-button', args, context.globals.appearance) }

export const ToggleButton: Story = { args: { label: 'Toggle button', checked: true }, render: (args, context) => preview('cb-toggle-button', args, context.globals.appearance) }

export const ButtonGroup: Story = { args: { label: 'Button group', value: 'one', items }, render: (args, context) => preview('cb-button-group', args, context.globals.appearance) }

export const Toolbar: Story = { args: { label: 'Toolbar', value: 'one', items }, render: (args, context) => preview('cb-toolbar', args, context.globals.appearance) }

export const ActionBar: Story = { args: { label: 'Action bar', value: 'one', items }, render: (args, context) => preview('cb-action-bar', args, context.globals.appearance) }

export const Shortcut: Story = { args: { label: 'Shortcut', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-shortcut', args, context.globals.appearance) }

export const LinkButton: Story = { args: { label: 'Link button', value: '12 px', placeholder: 'Link button' }, render: (args, context) => preview('cb-link-button', args, context.globals.appearance) }
