import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/layout/index.js'

const meta: Meta = { title: 'Layout', tags: ['autodocs'], parameters: { docs: { description: { component: 'Layout components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const WidthHeight: Story = { args: { label: 'Width height', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-width-height', args, context.globals.appearance) }

export const MinMax: Story = { args: { label: 'Min max', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-min-max', args, context.globals.appearance) }

export const AspectRatio: Story = { args: { label: 'Aspect ratio', value: '12 px', placeholder: 'Aspect ratio' }, render: (args, context) => preview('cb-aspect-ratio', args, context.globals.appearance) }

export const BoxModel: Story = { args: { label: 'Box model', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-box-model', args, context.globals.appearance) }

export const MarginPadding: Story = { args: { label: 'Margin padding', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-margin-padding', args, context.globals.appearance) }

export const FlexDirection: Story = { args: { label: 'Flex direction', value: 'one', items }, render: (args, context) => preview('cb-flex-direction', args, context.globals.appearance) }

export const FlexAlignment: Story = { args: { label: 'Flex alignment', value: 'one', items }, render: (args, context) => preview('cb-flex-alignment', args, context.globals.appearance) }

export const Gap: Story = { args: { label: 'Gap', value: 24, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-gap', args, context.globals.appearance) }

export const GridEditor: Story = { args: { label: 'Grid editor', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-grid-editor', args, context.globals.appearance) }

export const GridTrack: Story = { args: { label: 'Grid track', items }, render: (args, context) => preview('cb-grid-track', args, context.globals.appearance) }

export const Position: Story = { args: { label: 'Position', value: 'one', items }, render: (args, context) => preview('cb-position', args, context.globals.appearance) }

export const Anchor: Story = { args: { label: 'Anchor', value: 'one', items }, render: (args, context) => preview('cb-anchor', args, context.globals.appearance) }

export const Overflow: Story = { args: { label: 'Overflow', value: 'one', items }, render: (args, context) => preview('cb-overflow', args, context.globals.appearance) }

export const Breakpoints: Story = { args: { label: 'Breakpoints', items }, render: (args, context) => preview('cb-breakpoints', args, context.globals.appearance) }

export const LayoutVisibility: Story = { args: { label: 'Visibility', checked: true }, render: (args, context) => preview('cb-layout-visibility', args, context.globals.appearance) }

export const Transform: Story = { args: { label: 'Transform', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-transform', args, context.globals.appearance) }

export const Rotation: Story = { args: { label: 'Rotation', value: 64, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-rotation', args, context.globals.appearance) }

export const ZIndex: Story = { args: { label: 'Z index', value: 24, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-z-index', args, context.globals.appearance) }

export const SizingMode: Story = { args: { label: 'Sizing mode', value: 'one', items }, render: (args, context) => preview('cb-sizing-mode', args, context.globals.appearance) }

export const Inspector: Story = { args: { label: 'Inspector', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-inspector', args, context.globals.appearance) }

export const CollapsibleSidebar: Story = { args: { label: 'Collapsible sidebar', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-collapsible-sidebar', args, context.globals.appearance) }

export const ResizablePanel: Story = { args: { label: 'Resizable panel', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-resizable-panel', args, context.globals.appearance) }

export const DockedPanel: Story = { args: { label: 'Docked panel', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-docked-panel', args, context.globals.appearance) }

export const PanelHeader: Story = { args: { label: 'Panel header', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-panel-header', args, context.globals.appearance) }

export const TopBar: Story = { args: { label: 'Top bar', actionLabel: 'Open' }, render: (args, context) => preview('cb-top-bar', args, context.globals.appearance) }

export const InspectorSidebar: Story = { args: { label: 'Inspector sidebar', actionLabel: 'Open' }, render: (args, context) => preview('cb-inspector-sidebar', args, context.globals.appearance) }

export const AssetSidebar: Story = { args: { label: 'Asset sidebar', actionLabel: 'Open' }, render: (args, context) => preview('cb-asset-sidebar', args, context.globals.appearance) }

export const StatusBar: Story = { args: { label: 'Status bar', actionLabel: 'Open' }, render: (args, context) => preview('cb-status-bar', args, context.globals.appearance) }

export const Divider: Story = { args: { label: 'Divider', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-divider', args, context.globals.appearance) }

export const Box: Story = { args: { label: 'Box', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-box', args, context.globals.appearance) }

export const Row: Story = { args: { label: 'Row', value: 'one', items }, render: (args, context) => preview('cb-row', args, context.globals.appearance) }

export const Col: Story = { args: { label: 'Col', value: 'one', items }, render: (args, context) => preview('cb-col', args, context.globals.appearance) }

export const Grid: Story = { args: { label: 'Grid', value: 'one', items }, render: (args, context) => preview('cb-grid', args, context.globals.appearance) }
