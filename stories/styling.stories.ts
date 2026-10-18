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

export const Hue: Story = { args: { label: 'Hue', value: 64, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-hue', args, context.globals.appearance) }

export const Alpha: Story = { args: { label: 'Alpha', value: 64, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-alpha', args, context.globals.appearance) }

export const GradientEditor: Story = { args: { label: 'Gradient editor', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-gradient-editor', args, context.globals.appearance) }

export const GradientStops: Story = { args: { label: 'Gradient stops', items }, render: (args, context) => preview('cb-gradient-stops', args, context.globals.appearance) }

export const Fill: Story = { args: { label: 'Fill', value: '#2563eb' }, render: (args, context) => preview('cb-fill', args, context.globals.appearance) }

export const Stroke: Story = { args: { label: 'Stroke', value: '#2563eb' }, render: (args, context) => preview('cb-stroke', args, context.globals.appearance) }

export const Shadow: Story = { args: { label: 'Shadow', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-shadow', args, context.globals.appearance) }

export const Opacity: Story = { args: { label: 'Opacity', value: 64, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-opacity', args, context.globals.appearance) }

export const BlendMode: Story = { args: { label: 'Blend mode', value: 'one', items }, render: (args, context) => preview('cb-blend-mode', args, context.globals.appearance) }

export const Radius: Story = { args: { label: 'Radius', value: 24, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-radius', args, context.globals.appearance) }

export const Spacing: Story = { args: { label: 'Spacing', value: 24, min: 0, max: 100, step: 1 }, render: (args, context) => preview('cb-spacing', args, context.globals.appearance) }

export const Typography: Story = { args: { label: 'Typography', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-typography', args, context.globals.appearance) }

export const FontFamily: Story = { args: { label: 'Font family', value: 'one', items }, render: (args, context) => preview('cb-font-family', args, context.globals.appearance) }

export const FontWeight: Story = { args: { label: 'Font weight', value: 'one', items }, render: (args, context) => preview('cb-font-weight', args, context.globals.appearance) }

export const Decoration: Story = { args: { label: 'Decoration', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-decoration', args, context.globals.appearance) }

export const Alignment: Story = { args: { label: 'Alignment', value: 'one', items }, render: (args, context) => preview('cb-alignment', args, context.globals.appearance) }

export const CSSVariable: Story = { args: { label: 'CSS variable', value: '12 px', placeholder: 'CSS variable' }, render: (args, context) => preview('cb-css-variable', args, context.globals.appearance) }

export const DesignToken: Story = { args: { label: 'Design token', items }, render: (args, context) => preview('cb-design-token', args, context.globals.appearance) }

export const ImageBackground: Story = { args: { label: 'Image background' }, render: (args, context) => preview('cb-image-background', args, context.globals.appearance) }

export const Filter: Story = { args: { label: 'Filter', actionLabel: 'Edit', value: '12 px' }, render: (args, context) => preview('cb-filter', args, context.globals.appearance) }
