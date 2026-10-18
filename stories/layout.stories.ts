import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/layout/index.js'

const meta: Meta = { title: 'Layout', tags: ['autodocs'], parameters: { docs: { description: { component: 'Layout components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const CollapsibleSidebar: Story = { args: { label: 'Collapsible sidebar', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-collapsible-sidebar', args, context.globals.appearance) }

export const ResizablePanel: Story = { args: { label: 'Resizable panel', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-resizable-panel', args, context.globals.appearance) }

export const DockedPanel: Story = { args: { label: 'Docked panel', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-docked-panel', args, context.globals.appearance) }

export const PanelHeader: Story = { args: { label: 'Panel header', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-panel-header', args, context.globals.appearance) }

export const Divider: Story = { args: { label: 'Divider', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-divider', args, context.globals.appearance) }

export const Box: Story = { args: { label: 'Box', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-box', args, context.globals.appearance) }

export const Row: Story = { args: { label: 'Row', value: 'one', items }, render: (args, context) => preview('cb-row', args, context.globals.appearance) }

export const Col: Story = { args: { label: 'Col', value: 'one', items }, render: (args, context) => preview('cb-col', args, context.globals.appearance) }

export const Grid: Story = { args: { label: 'Grid', value: 'one', items }, render: (args, context) => preview('cb-grid', args, context.globals.appearance) }
