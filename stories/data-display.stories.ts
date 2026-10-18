import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { preview } from './helpers.js'
import '../components/data-display/index.js'

const meta: Meta = { title: 'Data display', tags: ['autodocs'], parameters: { docs: { description: { component: 'Data display components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Badge: Story = { args: { label: 'Badge', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-badge', args, context.globals.appearance) }

export const Avatar: Story = { args: { label: 'Avatar', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-avatar', args, context.globals.appearance) }

export const Card: Story = { args: { label: 'Card', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-card', args, context.globals.appearance) }

export const List: Story = { args: { label: 'List', value: 'one', items }, render: (args, context) => preview('cb-list', args, context.globals.appearance) }

export const DescriptionRow: Story = { args: { label: 'Description row', value: 'Example', status: 'Ready' }, render: (args, context) => preview('cb-description-row', args, context.globals.appearance) }

export const Table: Story = { args: { label: 'Table', value: 'one', items }, render: (args, context) => preview('cb-table', args, context.globals.appearance) }

export const Tree: Story = { args: { label: 'Tree', value: 'one', items }, render: (args, context) => preview('cb-tree', args, context.globals.appearance) }

export const Accordion: Story = { args: { label: 'Accordion', actionLabel: 'Open', expanded: true }, render: (args, context) => preview('cb-accordion', args, context.globals.appearance) }

export const CodePreview: Story = { args: { label: 'Code preview', code: '<cb-button label="Save"></cb-button>', codeLanguage: 'html' }, render: (args, context) => preview('cb-code-preview', args, context.globals.appearance) }
