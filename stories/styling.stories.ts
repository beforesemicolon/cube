import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/styling/index.js'

const meta: Meta = { title: 'Styling', tags: ['autodocs'], parameters: { docs: { description: { component: 'Styling components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const ColorPicker: Story = componentStory('cb-color-picker', {
    label: 'Fill color', accessibleLabel: 'Choose fill color', value: '#2563ebcc', native: false, allowAlpha: true, allowSampler: true,
    swatches: ['#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#16a34a','#0891b2','#111827','#ffffff'], recentColors: [], maxRecent: 8,
    hueLabel: 'Hue', saturationLabel: 'Saturation', valueLabel: 'Brightness', alphaLabel: 'Alpha', redLabel: 'Red', greenLabel: 'Green', blueLabel: 'Blue', hexLabel: 'HEX', planeLabel: 'Saturation and brightness',
    samplerLabel: 'Sample color from screen', closeLabel: 'Close color picker', swatchesLabel: 'Saved and recent colors', transparentLabel: 'Transparent',
})

export const GradientEditor: Story = componentStory('cb-gradient-editor', { label: 'Gradient editor', actionLabel: 'Edit', value: '12 px' })

export const GradientStops: Story = componentStory('cb-gradient-stops', { label: 'Gradient stops', items })
