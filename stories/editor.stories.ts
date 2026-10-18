import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/editor/index.js'

const meta: Meta = { title: 'Editor', tags: ['autodocs'], parameters: { docs: { description: { component: 'Editor components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Viewport: Story = componentStory('cb-viewport', { label: 'Viewport', accessibleLabel: 'Viewport canvas' })

export const Artboard: Story = componentStory('cb-artboard', { label: 'Artboard', accessibleLabel: 'Artboard canvas' })

export const Rulers: Story = componentStory('cb-rulers', { label: 'Rulers', accessibleLabel: 'Rulers canvas' })

export const DeviceFrame: Story = componentStory('cb-device-frame', { label: 'Device frame', accessibleLabel: 'Device frame canvas' })

export const Expression: Story = componentStory('cb-expression', { label: 'Expression', value: '12 px', placeholder: 'Expression' })

export const Bezier: Story = componentStory('cb-bezier', { label: 'Bezier', accessibleLabel: 'Bezier canvas' })

export const Timeline: Story = componentStory('cb-timeline', { label: 'Timeline', accessibleLabel: 'Timeline canvas' })
