import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/layout/index.js'

const meta: Meta = { title: 'Layout', tags: ['autodocs'], parameters: { docs: { description: { component: 'Layout components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const CollapsibleSidebar: Story = componentStory('cb-collapsible-sidebar', { label: 'Collapsible sidebar', actionLabel: 'Open', expanded: true })

export const ResizablePanel: Story = componentStory('cb-resizable-panel', { label: 'Resizable panel', actionLabel: 'Open', expanded: true })

export const DockedPanel: Story = componentStory('cb-docked-panel', { label: 'Docked panel', actionLabel: 'Open', expanded: true })

export const PanelHeader: Story = componentStory('cb-panel-header', { label: 'Panel header', actionLabel: 'Open', expanded: true })

export const Divider: Story = componentStory('cb-divider', { orientation: 'horizontal', decorative: false })

export const Box: Story = componentStory('cb-box', { inlineSize: '100%', padding: '16px', background: 'var(--color-surface-muted)', radius: '8px' })

export const Row: Story = componentStory('cb-row', { gap: '8px', align: 'center', justify: 'start', wrap: true, reverse: false, collapseAt: 'sm' })

export const Col: Story = componentStory('cb-col', { gap: '8px', align: 'stretch', justify: 'start', reverse: false })

export const Grid: Story = componentStory('cb-grid', { columns: 'repeat(3,minmax(0,1fr))', rows: '', gap: '8px', autoFlow: 'row', align: 'stretch', justify: 'stretch' })
