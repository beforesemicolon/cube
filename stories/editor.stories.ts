import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/editor/index.js'

const meta: Meta = { title: 'Editor', tags: ['autodocs'], parameters: { docs: { description: { component: 'Editor components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Viewport: Story = { args: { label: 'Viewport', accessibleLabel: 'Viewport canvas' }, render: (args, context) => preview('cb-viewport', args, context.globals.appearance) }

export const Artboard: Story = { args: { label: 'Artboard', accessibleLabel: 'Artboard canvas' }, render: (args, context) => preview('cb-artboard', args, context.globals.appearance) }

export const Rulers: Story = { args: { label: 'Rulers', accessibleLabel: 'Rulers canvas' }, render: (args, context) => preview('cb-rulers', args, context.globals.appearance) }

export const DeviceFrame: Story = { args: { label: 'Device frame', accessibleLabel: 'Device frame canvas' }, render: (args, context) => preview('cb-device-frame', args, context.globals.appearance) }

export const Expression: Story = { args: { label: 'Expression', value: '12 px', placeholder: 'Expression' }, render: (args, context) => preview('cb-expression', args, context.globals.appearance) }

export const Bezier: Story = { args: { label: 'Bezier', accessibleLabel: 'Bezier canvas' }, render: (args, context) => preview('cb-bezier', args, context.globals.appearance) }

export const Timeline: Story = { args: { label: 'Timeline', accessibleLabel: 'Timeline canvas' }, render: (args, context) => preview('cb-timeline', args, context.globals.appearance) }
