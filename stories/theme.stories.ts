import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/theme/index.js'

const meta: Meta = { title: 'Theme', tags: ['autodocs'], parameters: { docs: { description: { component: 'Theme components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const ThemeProvider: Story = { args: { label: 'Theme provider', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-theme-provider', args, context.globals.appearance) }
