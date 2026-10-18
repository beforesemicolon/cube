import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/icons/index.js'

const meta: Meta = { title: 'Icons', tags: ['autodocs'], parameters: { docs: { description: { component: 'Icons components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Icon: Story = componentStory('cb-icon', { label: 'Settings', name: 'settings', size: 'md', disabled: false })
