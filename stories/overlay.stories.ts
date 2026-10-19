import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/overlay/index.js'

const meta: Meta = { title: 'Overlay', tags: ['autodocs'], parameters: { docs: { description: { component: 'Overlay components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Popover: Story = componentStory('cb-popover', { label: 'Layer actions', accessibleLabel: 'Layer actions', open: false, placement: 'bottom-start' })

export const Drawer: Story = componentStory('cb-drawer', { heading: 'Page settings', description: 'Update the current page.', closeLabel: 'Close page settings', open: false, dismissible: true, closeOnBackdrop: true, placement: 'end' })

export const HoverCard: Story = componentStory('cb-hover-card', { open: false, placement: 'bottom-start', delay: 250 })

export const BottomSheet: Story = componentStory('cb-bottom-sheet', { heading: 'Insert block', description: 'Choose content to add to the page.', closeLabel: 'Close block picker', open: false, dismissible: true, closeOnBackdrop: true })

export const ContextMenu: Story = componentStory('cb-context-menu', { label: 'Context menu', items, open: false, x: 32, y: 32, loop: true })

export const Dropdown: Story = componentStory('cb-dropdown', { label: 'Dropdown', value: '', loading: false, items, open: false, placement: 'bottom-start', icon: 'down' })

export const CommandPalette: Story = componentStory('cb-command-palette', { label: 'Command palette', items, open: false, query: '', placeholder: 'Search commands', emptyLabel: 'No commands found' })

export const Tooltip: Story = componentStory('cb-tooltip', { content: 'Align selected layers', placement: 'top', delay: 250, open: false })

export const Modal: Story = componentStory('cb-modal', { heading: 'Create a page', description: 'Add a page to this project.', open: false, dismissible: true, closeOnBackdrop: true, modalSize: 'md', closeLabel: 'Close', cancelLabel: 'Cancel', showCancel: true })

export const AlertDialog: Story = componentStory('cb-alert-dialog', { heading: 'Delete component?', description: 'This action cannot be undone.', open: false, dismissible: true, closeOnBackdrop: true, modalSize: 'sm', confirmLabel: 'Delete', cancelLabel: 'Cancel', destructive: true, busy: false })
