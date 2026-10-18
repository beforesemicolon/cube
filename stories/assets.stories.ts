import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/assets/index.js'

const meta: Meta = { title: 'Assets', tags: ['autodocs'], parameters: { docs: { description: { component: 'Assets components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const LayerTree: Story = { args: { label: 'Layer tree', value: 'one', items }, render: (args, context) => preview('cb-layer-tree', args, context.globals.appearance) }

export const LayerRow: Story = { args: { label: 'Layer row', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-layer-row', args, context.globals.appearance) }

export const LayerVisibility: Story = { args: { label: 'Visibility', checked: true }, render: (args, context) => preview('cb-layer-visibility', args, context.globals.appearance) }

export const Lock: Story = { args: { label: 'Lock', checked: true }, render: (args, context) => preview('cb-lock', args, context.globals.appearance) }

export const Reorder: Story = { args: { label: 'Reorder', value: 'one', items }, render: (args, context) => preview('cb-reorder', args, context.globals.appearance) }

export const ComponentBrowser: Story = { args: { label: 'Component browser', value: 'one', items }, render: (args, context) => preview('cb-component-browser', args, context.globals.appearance) }

export const ComponentPreview: Story = { args: { label: 'Component preview', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-component-preview', args, context.globals.appearance) }

export const InstanceIndicator: Story = { args: { label: 'Instance indicator', value: 'Ready', status: 'Updated' }, render: (args, context) => preview('cb-instance-indicator', args, context.globals.appearance) }

export const AssetManager: Story = { args: { label: 'Asset manager', value: 'one', items }, render: (args, context) => preview('cb-asset-manager', args, context.globals.appearance) }

export const ImageBrowser: Story = { args: { label: 'Image browser', value: 'one', items }, render: (args, context) => preview('cb-image-browser', args, context.globals.appearance) }

export const FontBrowser: Story = { args: { label: 'Font browser', value: 'one', items }, render: (args, context) => preview('cb-font-browser', args, context.globals.appearance) }

export const IconBrowser: Story = { args: { label: 'Icon browser', value: 'one', items }, render: (args, context) => preview('cb-icon-browser', args, context.globals.appearance) }

export const PageThumbnail: Story = { args: { label: 'Page thumbnail', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-page-thumbnail', args, context.globals.appearance) }

export const SymbolLibrary: Story = { args: { label: 'Symbol library', value: 'one', items }, render: (args, context) => preview('cb-symbol-library', args, context.globals.appearance) }

export const Variants: Story = { args: { label: 'Variants', value: 'one', items }, render: (args, context) => preview('cb-variants', args, context.globals.appearance) }

export const History: Story = { args: { label: 'History', value: 'one', items }, render: (args, context) => preview('cb-history', args, context.globals.appearance) }
