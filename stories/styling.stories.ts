import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/styling/index.js'

const meta: Meta = { title: 'Styling', tags: ['autodocs'], parameters: { docs: { description: { component: 'Styling components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const ColorPicker: Story = { args: { label: 'Color picker', value: '#2563eb' }, render: (args, context) => preview('cb-color-picker', args, context.globals.appearance) }

export const ColorSwatch: Story = { args: { label: 'Color swatch', value: '#2563eb' }, render: (args, context) => preview('cb-color-swatch', args, context.globals.appearance) }

export const Eyedropper: Story = { args: { label: 'Eyedropper', value: '#2563eb' }, render: (args, context) => preview('cb-eyedropper', args, context.globals.appearance) }

export const GradientEditor: Story = { args: { label: 'Gradient editor', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-gradient-editor', args, context.globals.appearance) }

export const GradientStops: Story = { args: { label: 'Gradient stops', items }, render: (args, context) => preview('cb-gradient-stops', args, context.globals.appearance) }
