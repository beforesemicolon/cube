import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/layout/index.js'

const meta: Meta = { title: 'Layout', tags: ['autodocs'], parameters: { docs: { description: { component: 'Layout components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
export const CollapsibleSidebar: Story = componentStory('cb-collapsible-sidebar', { label: 'Layers', description: 'Project navigation', accessibleLabel: 'Layers sidebar', expanded: true, placement: 'start', expandLabel: 'Expand sidebar', collapseLabel: 'Collapse sidebar' })

export const ResizablePanel: Story = componentStory('cb-resizable-panel', { label: 'Properties', accessibleLabel: 'Properties panel', resizeLabel: 'Resize properties panel', value: 320, min: 220, max: 640, step: 16, placement: 'end' })

export const DockedPanel: Story = componentStory('cb-docked-panel', { label: 'Inspector', description: 'Selection details', accessibleLabel: 'Inspector panel', expanded: true, collapsible: true, placement: 'end', expandLabel: 'Expand inspector', collapseLabel: 'Collapse inspector' })

export const PanelHeader: Story = componentStory('cb-panel-header', { label: 'Typography', description: 'Text properties', collapsible: true, expanded: true, expandLabel: 'Expand typography', collapseLabel: 'Collapse typography' })

export const Divider: Story = componentStory('cb-divider', { orientation: 'horizontal', decorative: false })

export const Box: Story = componentStory('cb-box', { inlineSize: '100%', padding: '16px', background: 'var(--color-surface-muted)', radius: '8px' })

export const Row: Story = componentStory('cb-row', { gap: '8px', align: 'center', justify: 'start', wrap: true, reverse: false, collapseAt: 'sm' })

export const Col: Story = componentStory('cb-col', { gap: '8px', align: 'stretch', justify: 'start', reverse: false })

export const Grid: Story = componentStory('cb-grid', { columns: 'repeat(3,minmax(0,1fr))', rows: '', gap: '8px', autoFlow: 'row', align: 'stretch', justify: 'stretch' })
