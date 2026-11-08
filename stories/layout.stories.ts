import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import './setup.js'

const meta: Meta = { title: 'Layout', tags: ['autodocs'], parameters: { docs: { description: { component: 'Layout components with headless bases, themed parts, category initialization and browser clients.' } } } }
export default meta
type Story = StoryObj
export const Sidebar: Story = componentStory('cb-sidebar', { label: 'Layers', description: 'Project navigation', accessibleLabel: 'Layers sidebar', collapsible: true, expanded: true, placement: 'start', expandLabel: 'Expand sidebar', collapseLabel: 'Collapse sidebar' })

export const ResizablePanel: Story = componentStory('cb-resizable-panel', { label: 'Properties', accessibleLabel: 'Properties panel', resizeLabel: 'Resize properties panel', value: 320, defaultValue: 320, min: 220, max: 640, step: 16, placement: 'end', collapseAt: 700, variant: 'panel' })

export const DockedPanel: Story = componentStory('cb-docked-panel', { label: 'Inspector', description: 'Selection details', accessibleLabel: 'Inspector panel', expanded: true, collapsible: true, placement: 'end', expandLabel: 'Expand inspector', collapseLabel: 'Collapse inspector' })

export const PanelHeader: Story = componentStory('cb-panel-header', { label: 'Typography', description: 'Text properties', collapsible: true, expanded: true, expandLabel: 'Expand typography', collapseLabel: 'Collapse typography' })

export const Toolbar: Story = componentStory('cb-toolbar', { label: 'Toolbar' })

export const ActionBar: Story = componentStory('cb-action-bar', { label: 'Action bar' })

export const Divider: Story = componentStory('cb-divider', { stacked: false, decorative: false })

export const Box: Story = componentStory('cb-box', { inlineSize: '100%', padding: '16px', background: 'var(--color-surface-muted)', radius: '8px' })

export const Row: Story = componentStory('cb-row', { gap: '8px', align: 'center', justify: 'start', wrap: true, reverse: false, collapseAt: 'sm' })

export const Col: Story = componentStory('cb-col', { gap: '8px', align: 'stretch', justify: 'start', reverse: false })

export const Grid: Story = componentStory('cb-grid', { columns: 'repeat(3,minmax(0,1fr))', rows: '', gap: '8px', autoFlow: 'row', align: 'stretch', justify: 'stretch' })

export const Workspace: Story = componentStory('cb-workspace', {
    variant: 'default', startValue: '', endValue: '', bottomValue: '',
    startItems: [{ id: 'pages', name: 'Pages', description: 'Browse project pages.', iconName: 'file' }, { id: 'layers', name: 'Layers', description: 'Explore the active page structure.', iconName: 'layers' }],
    endItems: [{ id: 'properties', name: 'Properties', iconName: 'settings' }, { id: 'styles', name: 'Styles', iconName: 'edit' }],
    bottomItems: [{ id: 'timeline', name: 'Timeline' }, { id: 'console', name: 'Console' }],
    label: 'Editor workspace', accessibleLabel: 'Site editor workspace', startOpen: true, endOpen: true, bottomOpen: false,
    startSize: 240, endSize: 300, bottomSize: 180, minStartSize: 180, maxStartSize: 520, minEndSize: 220, maxEndSize: 640,
    minBottomSize: 140, maxBottomSize: 420, resizeStep: 16, mobileBreakpoint: 700, mobilePanel: '', persistKey: '',
    startLabel: 'Pages and layers', endLabel: 'Properties', bottomLabel: 'Timeline', openStartLabel: 'Open pages and layers',
    closeStartLabel: 'Close pages and layers', openEndLabel: 'Open properties', closeEndLabel: 'Close properties',
    openBottomLabel: 'Open timeline', closeBottomLabel: 'Close timeline', closeMobileLabel: 'Close open panel',
})
