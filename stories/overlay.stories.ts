import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/overlay/index.js'

const meta: Meta = { title: 'Overlay', tags: ['autodocs'], parameters: { docs: { description: { component: 'Overlay components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Popover: Story = { args: { label: 'Popover', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-popover', args, context.globals.appearance) }

export const Drawer: Story = { args: { label: 'Drawer', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-drawer', args, context.globals.appearance) }

export const FloatingPanel: Story = { args: { label: 'Floating panel', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-floating-panel', args, context.globals.appearance) }

export const HoverCard: Story = { args: { label: 'Hover card', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-hover-card', args, context.globals.appearance) }

export const BottomSheet: Story = { args: { label: 'Bottom sheet', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-bottom-sheet', args, context.globals.appearance) }

export const Preferences: Story = { args: { label: 'Preferences', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-preferences', args, context.globals.appearance) }

export const ShareDialog: Story = { args: { label: 'Share dialog', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-share-dialog', args, context.globals.appearance) }

export const PublishDialog: Story = { args: { label: 'Publish dialog', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-publish-dialog', args, context.globals.appearance) }

export const ContextMenu: Story = { args: { label: 'Context menu', value: 'one', items }, render: (args, context) => preview('cb-context-menu', args, context.globals.appearance) }

export const Dropdown: Story = { args: { label: 'Dropdown', value: 'one', items }, render: (args, context) => preview('cb-dropdown', args, context.globals.appearance) }

export const CommandPalette: Story = { args: { label: 'Command palette', value: 'one', items }, render: (args, context) => preview('cb-command-palette', args, context.globals.appearance) }

export const Tooltip: Story = { args: { label: 'Tooltip', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-tooltip', args, context.globals.appearance) }

export const Modal: Story = { args: { label: 'Modal', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-modal', args, context.globals.appearance) }

export const AlertDialog: Story = { args: { label: 'Alert dialog', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-alert-dialog', args, context.globals.appearance) }
