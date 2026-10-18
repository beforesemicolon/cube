import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/icons/index.js'

const meta: Meta = { title: 'Icons', tags: ['autodocs'], parameters: { docs: { description: { component: 'Icons components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Icon: Story = { args: { label: 'Icon', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-icon', args, context.globals.appearance) }
