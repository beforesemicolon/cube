import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/styling/index.js'

const meta: Meta = { title: 'Styling', tags: ['autodocs'], parameters: { docs: { description: { component: 'Styling components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const ColorPicker: Story = componentStory('cb-color-picker', { label: 'Color picker', value: '#2563eb' })

export const ColorSwatch: Story = componentStory('cb-color-swatch', { label: 'Color swatch', value: '#2563eb' })

export const Eyedropper: Story = componentStory('cb-eyedropper', { label: 'Eyedropper', value: '#2563eb' })

export const GradientEditor: Story = componentStory('cb-gradient-editor', { label: 'Gradient editor', actionLabel: 'Edit', value: '12 px' })

export const GradientStops: Story = componentStory('cb-gradient-stops', { label: 'Gradient stops', items })
