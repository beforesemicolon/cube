import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/data-display/index.js'

const meta: Meta = { title: 'Data display', tags: ['autodocs'], parameters: { docs: { description: { component: 'Data display components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Badge: Story = componentStory('cb-badge', { label: 'Badge', value: 'Example', status: 'Ready' })

export const Avatar: Story = componentStory('cb-avatar', { label: 'Avatar', value: 'Example', status: 'Ready' })

export const Card: Story = componentStory('cb-card', { label: 'Card', actionLabel: 'Open', expanded: true })

export const List: Story = componentStory('cb-list', { label: 'List', value: 'one', items })

export const DescriptionRow: Story = componentStory('cb-description-row', { label: 'Description row', value: 'Example', status: 'Ready' })

export const Table: Story = componentStory('cb-table', { label: 'Table', value: 'one', items })

export const Tree: Story = componentStory('cb-tree', { label: 'Tree', value: 'one', items })

export const Accordion: Story = componentStory('cb-accordion', { label: 'Accordion', actionLabel: 'Open', expanded: true })

export const CodePreview: Story = componentStory('cb-code-preview', { label: 'Code preview', code: '<cb-button label="Save"></cb-button>', codeLanguage: 'html' })
