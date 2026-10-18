import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/theme/index.js'

const meta: Meta = { title: 'Theme', tags: ['autodocs'], parameters: { docs: { description: { component: 'Theme components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const ThemeProvider: Story = componentStory('cb-theme-provider', { appearance: 'system', src: '', theme: null })
