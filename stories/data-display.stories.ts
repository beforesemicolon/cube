import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import './setup.js'

const meta: Meta = { title: 'Data display', tags: ['autodocs'], parameters: { docs: { description: { component: 'Data display components with headless bases, themed parts, category initialization and browser clients.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]
const tableItems = [
    { id: 'website', parentId: '', name: 'Marketing website', status: 'Published', owner: 'Maya Chen', updated: 'Oct 18, 2026', selectable: true },
    { id: 'home', parentId: 'website', name: 'Home page', status: 'Published', owner: 'Maya Chen', updated: 'Oct 18, 2026', selectable: true },
    { id: 'pricing', parentId: 'website', name: 'Pricing page', status: 'Draft', owner: 'Noah Williams', updated: 'Oct 17, 2026', selectable: true },
    { id: 'design-system', parentId: '', name: 'Design system', status: 'In review', owner: 'Sofia Martins', updated: 'Oct 16, 2026', selectable: true },
    { id: 'archive', parentId: '', name: 'Archived campaign', status: 'Archived', owner: 'Liam Okafor', updated: 'Sep 29, 2026', selectable: false },
]
const tableColumns = [
    { id: 'name', header: 'Name', field: 'name', sortable: true, minWidth: 220 },
    { id: 'status', header: 'Status', field: 'status', sortable: true, width: 128 },
    { id: 'owner', header: 'Owner', field: 'owner', sortable: true, minWidth: 160 },
    { id: 'updated', header: 'Updated', field: 'updated', sortable: true, minWidth: 140 },
]
const javascriptExample = [
    "import { createClient } from '@beforesemicolon/api'",
    '',
    'const DEFAULT_RETRIES = 3',
    'const projectPattern = /^cube-[a-z0-9-]+$/i',
    '',
    'class ProjectRepository {',
    '  #cache = new Map()',
    '',
    '  constructor({ baseUrl, token }) {',
    '    this.baseUrl = new URL(baseUrl)',
    '    this.client = createClient({',
    '      baseUrl: this.baseUrl,',
    "      headers: { accept: 'application/json', authorization: `Bearer ${token}` },",
    '    })',
    '  }',
    '',
    '  async find(projectId, { signal } = {}) {',
    '    if (!projectPattern.test(projectId)) {',
    '      throw new TypeError(`Invalid project: ${projectId}`)',
    '    }',
    '',
    '    const cached = this.#cache.get(projectId)',
    '    if (cached?.expiresAt > Date.now()) return cached.value',
    '',
    '    for (let attempt = 1; attempt <= DEFAULT_RETRIES; attempt += 1) {',
    '      try {',
    '        const response = await this.client.get(`/projects/${projectId}`, { signal })',
    '        const project = await response.json()',
    '        this.#cache.set(projectId, {',
    '          value: project,',
    '          expiresAt: Date.now() + 60_000,',
    '        })',
    '        return project',
    '      } catch (error) {',
    "        console.warn('Project request failed', { attempt, error })",
    '        if (signal?.aborted || attempt === DEFAULT_RETRIES) throw error',
    '        await new Promise(resolve => setTimeout(resolve, attempt * 250))',
    '      }',
    '    }',
    '  }',
    '}',
    '',
    "const repository = new ProjectRepository({ baseUrl: 'https://api.example.com', token: 'demo' })",
    "const project = await repository.find('cube-homepage')",
    '',
    'export const publishedNames = project.pages',
    "  .filter(({ status }) => status === 'published')",
    '  .map(({ name }) => name.trim())',
].join('\n')

export const Badge: Story = componentStory('cb-badge', { label: 'Badge', value: 'Example' })

export const Avatar: Story = componentStory('cb-avatar', {
    name: 'Elson Correia', accessibleLabel: 'Elson Correia', src: '', initials: '', color: '', size: 'sm',
    status: 'online', statusLabel: 'Online', decorative: false,
})

export const Card: Story = componentStory('cb-card', { width: '320px' })

export const List: Story = componentStory('cb-list', {
    accessibleLabel: 'List items', gap: '8px', orientation: 'vertical', offset: 40,
    items: Array.from({ length: 20 }, (_, index) => `Item ${index + 1}`),
})

export const Table: Story = componentStory('cb-table', {
    label: 'Project resources',
    items: tableItems,
    columns: tableColumns,
    itemKey: 'id',
    parentBy: 'parentId',
    expandedKeys: ['website'],
    selectionMode: 'multiple',
    selectedKeys: ['home'],
    selectableField: 'selectable',
    sortBy: 'name',
    sortDirection: 'asc',
    rowActivation: true,
    resizable: true,
    stickyHeader: true,
    stickyColumns: 1,
    striped: false,
    density: 'comfortable',
    emptyLabel: 'No project resources',
    loadingLabel: 'Loading project resources',
    selectAllLabel: 'Select all visible rows',
    deselectAllLabel: 'Deselect all visible rows',
    selectRowLabel: 'Select {row}',
    deselectRowLabel: 'Deselect {row}',
    expandRowLabel: 'Expand {row}',
    collapseRowLabel: 'Collapse {row}',
    expandGroupLabel: 'Expand {group}',
    collapseGroupLabel: 'Collapse {group}',
    sortAscendingLabel: 'Sort {column} ascending',
    sortDescendingLabel: 'Sort {column} descending',
    ascendingLabel: 'ascending',
    descendingLabel: 'descending',
    expandedLabel: 'expanded',
    collapsedLabel: 'collapsed',
    resizeColumnLabel: 'Resize {column} column',
    selectionAnnouncement: '{count} rows selected',
    sortAnnouncement: '{column} sorted {direction}',
    expansionAnnouncement: '{row} is {state}',
})

export const Tree: Story = componentStory('cb-tree', { label: 'Tree', value: 'one', items, emptyLabel: 'No items' })

export const Accordion: Story = componentStory('cb-accordion', {
    label: 'Accordion settings',
    items: [
        { id: 'advanced', label: 'Advanced settings', description: 'Optional controls for this element.', content: 'Custom attributes and rendering behavior.', actions: [{ id: 'edit', label: 'Open editor' }] },
        { id: 'appearance', label: 'Appearance', content: 'Theme, spacing, and responsive presentation.' },
        { id: 'unavailable', label: 'Element-specific controls', disabled: true, disabledReason: 'Unavailable for this element type' },
    ],
    expandedIds: ['advanced'],
    multiple: false,
    collapsible: true,
    animated: true,
    variant: 'simple',
    headingLevel: 3,
    emptyLabel: 'No settings available',
})

export const ExpandableSection: Story = componentStory('cb-expandable-section', {
    label: 'Static website hosting',
    description: '',
    counter: '',
    expanded: false,
    variant: 'default',
    headingLevel: 3,
    disableContentPadding: false,
})

export const CodePreview: Story = componentStory('cb-code-preview', {
    label: 'JavaScript repository example',
    code: javascriptExample,
    codeLanguage: 'javascript',
    copyLabel: 'Copy JavaScript',
    copiedLabel: 'JavaScript copied',
})

export const FileBrowser: Story = componentStory('cb-file-browser', {
    label: 'Project files', accessibleLabel: 'Project file browser', currentFolderId: '', query: '', view: 'grid', sortBy: 'name', sortDirection: 'asc',
    selectionMode: 'multiple', selectedIds: ['logo'], searchable: true, loading: false, searchLabel: 'Filter project files',
    searchPlaceholder: 'Search this folder', gridViewLabel: 'Grid view', tableViewLabel: 'Table view', breadcrumbLabel: 'Current folder',
    expandPathLabel: 'Show hidden path items', rootLabel: 'Project', nameLabel: 'Name', typeLabel: 'Type', sizeLabel: 'Size', modifiedLabel: 'Modified',
    emptyLabel: 'This folder is empty.', noMatchLabel: 'No files match this filter.', loadingLabel: 'Loading files', openEntryLabel: 'Open {entry}',
    selectEntryLabel: 'Select {entry}', deselectEntryLabel: 'Deselect {entry}', sortAscendingLabel: 'Sort {column} ascending', sortDescendingLabel: 'Sort {column} descending',
    entries: [
        { id: 'images', name: 'Images', type: 'folder', modified: 'Oct 18, 2026', description: '12 assets' },
        { id: 'documents', name: 'Documents', type: 'folder', modified: 'Oct 17, 2026', description: '4 documents' },
        { id: 'logo', name: 'cube-logo.svg', type: 'file', size: 18420, modified: 'Oct 18, 2026', mime: 'image/svg+xml' },
        { id: 'tokens', name: 'tokens.json', type: 'file', size: 9634, modified: 'Oct 16, 2026', mime: 'application/json' },
        { id: 'hero', name: 'hero.webp', type: 'file', parentId: 'images', size: 284332, modified: 'Oct 18, 2026', mime: 'image/webp' },
        { id: 'portrait', name: 'portrait.webp', type: 'file', parentId: 'images', size: 156201, modified: 'Oct 15, 2026', mime: 'image/webp' },
    ],
})

export const LayerTree: Story = componentStory('cb-layer-tree', {
    label: 'Page layers', accessibleLabel: 'Homepage layers', selectedIds: ['hero-heading'], expandedIds: ['page', 'hero'], multiple: true,
    editable: true, reorderable: true, showVisibility: true, showLock: true, emptyLabel: 'No layers', expandLabel: 'Expand {item}',
    collapseLabel: 'Collapse {item}', showLabel: 'Show {item}', hideLabel: 'Hide {item}', lockLabel: 'Lock {item}', unlockLabel: 'Unlock {item}',
    renameLabel: 'Rename {item}', saveLabel: 'Save name', cancelLabel: 'Cancel rename', moveLabel: 'Move {item}',
    items: [
        { id: 'page', label: 'Homepage', icon: 'layers', children: [
            { id: 'navigation', label: 'Navigation', icon: 'component', locked: true },
            { id: 'hero', label: 'Hero section', icon: 'layers', children: [
                { id: 'hero-heading', label: 'Make better products.', description: 'Heading', icon: 'text', actions: [
                    { id: 'duplicate', name: 'duplicate', icon: 'copy', label: 'Duplicate heading' },
                    { id: 'inspect', name: 'inspect', label: 'Inspect heading' },
                ] },
                { id: 'hero-image', label: 'Product preview', description: 'Image', icon: 'image' },
            ] },
            { id: 'features', label: 'Feature grid', icon: 'grid', hidden: true },
        ] },
    ],
})
