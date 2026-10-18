import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { componentCategoryOrder, componentCategoryTitles, resolveComponentCategory } from './component-taxonomy.mjs'

const groups = [
    ['inputs', [
        ['text-input','Text input','text'],['textarea','Textarea','textarea'],['number-input','Number input','number'],['unit-input','Unit input','number'],
        ['search','Search','search'],['combobox','Combobox','search'],['autocomplete','Autocomplete','search'],['multi-select','Multi select','select'],
        ['checkbox','Checkbox','choice'],['radio','Radio','choice'],['switch','Switch','choice'],['range-slider','Range slider','range'],
        ['stepper','Stepper','number'],['date-picker','Date picker','text'],['time-picker','Time picker','text'],['file-picker','File picker','file'],
        ['token-input','Token input','tokens'],['editable-label','Editable label','text'],['masked-input','Masked input','text'],
    ]],
    ['color-style', [
        ['color-picker','Color picker','color'],['color-swatch','Color swatch','color'],['eyedropper','Eyedropper','color'],['hue','Hue','range'],
        ['alpha','Alpha','range'],['gradient-editor','Gradient editor','editor'],['gradient-stops','Gradient stops','tokens'],['fill','Fill','color'],
        ['stroke','Stroke','color'],['shadow','Shadow','editor'],['opacity','Opacity','range'],['blend-mode','Blend mode','select'],
        ['radius','Radius','number'],['spacing','Spacing','number'],['typography','Typography','editor'],['font-family','Font family','select'],
        ['font-weight','Font weight','select'],['decoration','Decoration','editor'],['alignment','Alignment','collection'],['css-variable','CSS variable','text'],
        ['design-token','Design token','tokens'],['image-background','Image background','file'],['filter','Filter','editor'],
    ]],
    ['layout', [
        ['width-height','Width height','editor'],['min-max','Min max','editor'],['aspect-ratio','Aspect ratio','text'],['box-model','Box model','editor'],
        ['margin-padding','Margin padding','editor'],['flex-direction','Flex direction','collection'],['flex-alignment','Flex alignment','collection'],['gap','Gap','number'],
        ['grid-editor','Grid editor','editor'],['grid-track','Grid track','tokens'],['position','Position','select'],['anchor','Anchor','collection'],
        ['overflow','Overflow','select'],['breakpoints','Breakpoints','tokens'],['layout-visibility','Visibility','choice'],['transform','Transform','editor'],
        ['rotation','Rotation','range'],['z-index','Z index','number'],['sizing-mode','Sizing mode','collection'],
    ]],
    ['data-feedback', [
        ['badge','Badge','display'],['status','Status','status'],['avatar','Avatar','display'],['card','Card','panel'],['list','List','collection'],
        ['description-row','Description row','display'],['property-row','Property row','editor'],['table','Table','collection'],['tree','Tree','collection'],
        ['accordion','Accordion','panel'],['empty-state','Empty state','status'],['skeleton','Skeleton','status'],['progress','Progress','progress'],
        ['spinner','Spinner','progress'],['toast','Toast','status'],['alert','Alert','status'],['validation','Validation','status'],['banner','Banner','status'],
        ['stat','Stat','status'],['code-preview','Code preview','display'],['activity-log','Activity log','collection'],
    ]],
    ['overlays', [
        ['popover','Popover','panel'],['drawer','Drawer','panel'],['floating-panel','Floating panel','panel'],['inspector','Inspector','panel'],
        ['floating-toolbar','Floating toolbar','panel'],['nested-menu','Nested menu','collection'],['hover-card','Hover card','panel'],['bottom-sheet','Bottom sheet','panel'],
        ['collapsible-sidebar','Collapsible sidebar','panel'],['resizable-panel','Resizable panel','panel'],['docked-panel','Docked panel','panel'],
        ['panel-tabs','Panel tabs','collection'],['panel-header','Panel header','panel'],
    ]],
    ['canvas', [
        ['viewport','Viewport','canvas'],['artboard','Artboard','canvas'],['selection-box','Selection box','canvas'],['resize-handle','Resize handle','canvas'],
        ['rotation-handle','Rotation handle','canvas'],['multi-selection','Multi selection','canvas'],['hover-outline','Hover outline','canvas'],
        ['smart-guides','Smart guides','canvas'],['snap-lines','Snap lines','canvas'],['rulers','Rulers','canvas'],['grid-overlay','Grid overlay','canvas'],
        ['spacing-measure','Spacing measure','canvas'],['alignment-guide','Alignment guide','canvas'],['drop-indicator','Drop indicator','canvas'],
        ['drag-preview','Drag preview','canvas'],['zoom','Zoom','range'],['pan','Pan','canvas'],['cursor','Cursor','canvas'],['inline-text','Inline text','text'],
        ['marquee','Marquee','canvas'],['insertion','Insertion','canvas'],['canvas-menu','Canvas menu','collection'],['component-outline','Component outline','canvas'],
        ['lock-overlay','Lock overlay','canvas'],['hidden-indicator','Hidden indicator','canvas'],['device-frame','Device frame','canvas'],
    ]],
    ['assets-structure', [
        ['layer-tree','Layer tree','collection'],['layer-row','Layer row','display'],['layer-visibility','Visibility','choice'],['lock','Lock','choice'],
        ['reorder','Reorder','collection'],['component-browser','Component browser','collection'],['component-preview','Component preview','display'],
        ['instance-indicator','Instance indicator','status'],['asset-manager','Asset manager','collection'],['image-browser','Image browser','collection'],
        ['media-preview','Media preview','display'],['font-browser','Font browser','collection'],['icon-browser','Icon browser','collection'],
        ['page-navigator','Page navigator','collection'],['page-thumbnail','Page thumbnail','display'],['symbol-library','Symbol library','collection'],
        ['variants','Variants','collection'],['breakpoint-navigator','Breakpoint navigator','collection'],['history','History','collection'],
        ['undo-redo','Undo redo','editor'],['properties-inspector','Properties inspector','panel'],['property-group','Property group','panel'],
    ]],
    ['advanced-editors', [
        ['multi-value','Multi value','editor'],['linked-dimension','Linked dimension','editor'],['unit-conversion','Unit conversion','editor'],
        ['expression','Expression','text'],['variable-binding','Variable binding','select'],['responsive-override','Responsive override','editor'],
        ['state-selector','State selector','select'],['pseudo-state','Pseudo state','select'],['transition','Transition','editor'],['easing','Easing','select'],
        ['bezier','Bezier','canvas'],['timeline','Timeline','canvas'],['keyframe','Keyframe','editor'],['trigger','Trigger','select'],
        ['conditional-visibility','Conditional visibility','editor'],['data-binding','Data binding','editor'],['action-editor','Action editor','editor'],
        ['constraints','Constraints','collection'],
    ]],
    ['app-shell', [
        ['top-bar','Top bar','shell'],['workspace-switcher','Workspace switcher','select'],['project-picker','Project picker','select'],
        ['save-status','Save status','status'],['publish-status','Publish status','status'],
        ['design-code','Design code','collection'],['device-selector','Device selector','select'],['inspector-sidebar','Inspector sidebar','shell'],
        ['asset-sidebar','Asset sidebar','shell'],['status-bar','Status bar','shell'],['selection-trail','Selection trail','collection'],
        ['shortcuts','Shortcuts','collection'],['preferences','Preferences','panel'],['user-menu','User menu','collection'],
        ['version-history','Version history','collection'],['share-dialog','Share dialog','panel'],['publish-dialog','Publish dialog','panel'],
    ]],
    ['collaboration-ai', [
        ['presence','Presence','collaboration'],['remote-cursor','Remote cursor','canvas'],['comment-pin','Comment pin','canvas'],
        ['comment-thread','Comment thread','collaboration'],['annotation','Annotation','collaboration'],['review-status','Review status','status'],
        ['suggested-change','Suggested change','collaboration'],['ai-command','AI command','text'],['ai-action-menu','AI action menu','collection'],
        ['ai-selection-toolbar','AI selection toolbar','panel'],['diff-preview','Diff preview','display'],['accept-reject','Accept reject','editor'],
        ['generation','Generation','progress'],['conflict','Conflict','status'],['approval','Approval','editor'],
    ]],
]

const pascal = value => value.split('-').map(part => part === 'ai' ? 'AI' : part === 'css' ? 'CSS' : part.charAt(0).toUpperCase() + part.slice(1)).join('')
const definitions = groups.flatMap(([board, entries]) => entries.map(([name, title, kind]) => ({
    board,
    category: resolveComponentCategory(board, name),
    name,
    title,
    kind,
    className: pascal(name),
})))
// Only these Figma cards define reusable public components. Every other card is
// retained as a design reference and documented as an application-level example.
const publicStudioComponentNames = new Set([
    'text-input','textarea','number-input','unit-input','combobox','checkbox','switch','range-slider','stepper','date-picker','time-picker','file-picker','token-input','editable-label','masked-input',
    'color-picker','color-swatch','eyedropper','gradient-editor','gradient-stops',
    'collapsible-sidebar','resizable-panel','docked-panel','panel-header',
    'badge','avatar','card','list','description-row','table','tree','accordion','code-preview',
    'status','empty-state','skeleton','progress','spinner','toast','alert','banner',
    'popover','drawer','hover-card','bottom-sheet',
    'viewport','artboard','rulers','device-frame','expression','bezier','timeline',
    'presence','remote-cursor','comment-pin','comment-thread',
])
const publicDefinitions = definitions.filter(definition => publicStudioComponentNames.has(definition.name))
const quote = value => `'${value.replaceAll("'", "\\'")}'`
const reusedBoardItems = {
    actions: [
        ['button','Button'],['icon-button','Icon button'],['split-button','Split button'],['toggle-button','Toggle button'],['button-group','Button group'],
        ['segmented-control','Segmented control'],['tabs','Tabs'],['breadcrumb','Breadcrumb'],['menu','Menu'],['context-menu','Context menu'],
        ['dropdown','Dropdown'],['command-palette','Command palette'],['toolbar','Toolbar'],['action-bar','Action bar'],['link','Link'],
        ['pagination','Pagination'],['tooltip','Tooltip'],['shortcut','Shortcut'],
    ],
    inputs: [['select','Select'],['slider','Slider']],
    'data-feedback': [['divider','Divider']],
    overlays: [['modal','Modal'],['alert-dialog','Alert dialog']],
    'app-shell': [['undo-redo','Undo redo']],
}
const reusedSourceCategories = { actions:'actions', inputs:'inputs', 'data-feedback':'layout', overlays:'overlays', 'app-shell':'assets-structure' }
const reusedKinds = {
    button:'text', 'icon-button':'text', 'split-button':'panel', 'toggle-button':'choice', 'button-group':'collection',
    'segmented-control':'collection', tabs:'collection', breadcrumb:'collection', menu:'collection', 'context-menu':'collection',
    dropdown:'collection', 'command-palette':'collection', toolbar:'collection', 'action-bar':'collection', link:'text',
    pagination:'number', tooltip:'panel', shortcut:'display', select:'select', slider:'range', divider:'display',
    modal:'panel', 'alert-dialog':'panel', 'undo-redo':'editor',
}
const reusedDefinitions = Object.entries(reusedBoardItems).flatMap(([board, entries]) => entries.map(([name,title]) => ({
    board,
    category: resolveComponentCategory(reusedSourceCategories[board], name),
    name,
    title,
    kind: reusedKinds[name],
    className: pascal(name),
})))
const studioBoardItems = [
    ...reusedDefinitions.map(({board,category,name,title}) => ({board,category,name,title})),
    ...definitions.map(({board,category,name,title}) => ({board,category,name,title})),
]
const existingCategoryExports = {
    action: ["export * from './button/index.js'", "export * from './toggle-button/index.js'", "export * from './split-button/index.js'", "export * from './button-group/index.js'", "export * from './toolbar/index.js'", "export * from './action-bar/index.js'", "export * from './shortcut/index.js'"],
    form: ["export * from './slider/index.js'", "export * from './select/index.js'", "export * from './radio-group/index.js'", "export * from './calendar/index.js'", "export { normalizeRange, normalizeOptions } from './model.js'"],
    layout: ["export * from './box/index.js'", "export * from './row/index.js'", "export * from './col/index.js'", "export * from './grid/index.js'", "export * from './divider/index.js'"],
    navigation: ["export * from './link/index.js'", "export * from './segmented-control/index.js'", "export * from './tabs/index.js'", "export * from './breadcrumb/index.js'", "export * from './menu/index.js'", "export * from './pagination/index.js'"],
    overlay: ["export * from './context-menu/index.js'", "export * from './dropdown/index.js'", "export * from './command-palette/index.js'", "export * from './tooltip/index.js'", "export * from './modal/index.js'", "export * from './alert-dialog/index.js'"],
    feedback: ["export * from './flashbar/index.js'"],
    media: ["export * from './audio-player/index.js'", "export * from './video-player/index.js'"],
}
const documentationKeys = {
    action:'categoryAction', form:'categoryForm', layout:'studioLayout', navigation:'categoryNavigation', overlay:'categoryOverlay',
    feedback:'categoryFeedback', 'data-display':'categoryDataDisplay', media:'categoryMedia', styling:'categoryStyling', editor:'categoryEditor',
    assets:'categoryAssets', collaboration:'categoryCollaboration',
}
const definitionGroups = componentCategoryOrder
    .map(category => [category, publicDefinitions.filter(definition => definition.category === category)])
    .filter(([, entries]) => entries.length > 0)

const publicNamesSource = [...publicStudioComponentNames].map(quote).join(',')
const catalog = `import type { StudioBoardItem, StudioDefinition } from './types.js'\n\nconst allStudioDefinitions = [\n${definitions.map(d => `    { board:${quote(d.board)}, category:${quote(d.category)}, name:${quote(d.name)}, className:${quote(d.className)}, title:${quote(d.title)}, kind:${quote(d.kind)} },`).join('\n')}\n] as const satisfies readonly StudioDefinition[]\n\nconst allStudioBoardItems = [\n${studioBoardItems.map(item => `    { board:${quote(item.board)}, category:${quote(item.category)}, name:${quote(item.name)}, title:${quote(item.title)} },`).join('\n')}\n] as const satisfies readonly StudioBoardItem[]\n\nexport const publicStudioComponentNames: ReadonlySet<string> = new Set([${publicNamesSource}])\nexport const studioDefinitions = allStudioDefinitions.filter(definition => publicStudioComponentNames.has(definition.name))\nexport const studioBoardItems = allStudioBoardItems.filter(item => publicStudioComponentNames.has(item.name))\nexport const studioDesignReferences = allStudioBoardItems\nexport const studioGroups = [${definitionGroups.map(([name]) => quote(name)).join(', ')}] as const\nexport const studioEntries = studioDefinitions.map(({category,name,className}) => ({path:\`${'${category}'}/${'${name}'}\`,name,className}))\n`
await mkdir(resolve('components/studio'), { recursive: true })
await writeFile(resolve('components/studio/catalog.ts'), catalog)

const handBuiltComponents = new Set(['code-preview', 'combobox', 'date-picker', 'time-picker', 'unit-input'])
const componentTextProps = {
    stepper: [['decrementLabel', 'decrement-label'], ['incrementLabel', 'increment-label']],
    'file-picker': [['fileLabel', 'file-label'], ['fileRequirements', 'file-requirements']],
    table: [['nameLabel', 'name-label'], ['metadataLabel', 'metadata-label']],
}
for (const [category, entries] of definitionGroups) {
    const categoryDir = resolve('components', category)
    await mkdir(categoryDir, { recursive: true })
    const exports = [...(existingCategoryExports[category] ?? [])]
    for (const {name, title, kind, className} of entries) {
        const dir = resolve(categoryDir, name)
        await mkdir(dir, { recursive: true })
        if (handBuiltComponents.has(name)) {
            exports.push(`export * from './${name}/index.js'`)
            continue
        }
        const textProps = componentTextProps[name] ?? []
        const propTypes = textProps.map(([property]) => `\n    ${property}?: string`).join('')
        const propsDeclaration = textProps.length ? `{${propTypes}\n}` : '{}'
        const observed = textProps.length ? `\n    static observedAttributes = [...StudioComponentBase.observedAttributes, ${textProps.map(([,attribute]) => quote(attribute)).join(', ')}]` : ''
        const defaults = textProps.map(([property]) => `\n    ${property} = ''`).join('')
        await writeFile(resolve(dir, `${className}Base.ts`), `import { StudioComponentBase } from '../../studio/StudioComponentBase.js'\nimport type { StudioKind, StudioProps } from '../../studio/types.js'\n\nexport interface ${className}Props extends StudioProps ${propsDeclaration}\n\n/** Headless behavior for the ${title} component. */\nexport abstract class ${className}Base extends StudioComponentBase<${className}Props> {${observed}${defaults}\n    readonly componentName = '${name}'\n    readonly componentKind: StudioKind = '${kind}'\n}\n`)
        await writeFile(resolve(dir, 'base.ts'), `export { ${className}Base } from './${className}Base.js'\nexport type { ${className}Props } from './${className}Base.js'\n`)
        await writeFile(resolve(dir, 'index.ts'), `import { register } from '../../core/Component.js'\nimport { createStudioView, type StudioView } from '../../studio/view.js'\nimport { ${className}Base } from './${className}Base.js'\n\nexport class ${className} extends ${className}Base {\n    private view?: StudioView\n    render(): Node { this.view = createStudioView(this); return this.view.root }\n    protected syncView(): void { this.view?.update() }\n}\n\nregister('cb-${name}', ${className})\nexport { ${className}Base }\nexport type { ${className}Props } from './${className}Base.js'\n`)
        exports.push(`export * from './${name}/index.js'`)
    }
    await writeFile(resolve(categoryDir, 'index.ts'), exports.join('\n') + '\n')
}

const loaders = `/** Lazy registrations for public Studio-derived components only. */\nexport const studioComponentLoaders = {\n${publicDefinitions.map(d => `    '${d.name}': () => import('../${d.category}/${d.name}/index.js'),`).join('\n')}\n} as const\n`
await writeFile(resolve('components/studio/public-registry.ts'), loaders)

const sampleByKind = {
    text: `{ label: '${'${title}'}', value: '12 px', placeholder: '${'${title}'}' }`,
    textarea: `{ label: '${'${title}'}', value: 'Editable content' }`,
    number: `{ label: '${'${title}'}', value: 24, min: 0, max: 100, step: 1 }`,
    search: `{ label: '${'${title}'}', value: '', placeholder: 'Search', emptyLabel: 'No results' }`,
    select: `{ label: '${'${title}'}', value: 'one', items }`,
    choice: `{ label: '${'${title}'}', checked: true }`,
    range: `{ label: '${'${title}'}', value: 64, min: 0, max: 100, step: 1 }`,
    file: `{ label: '${'${title}'}' }`,
    color: `{ label: '${'${title}'}', value: '#2563eb' }`,
    tokens: `{ label: '${'${title}'}', items }`,
    display: `{ label: '${'${title}'}', value: 'Example', status: 'Ready' }`,
    collection: `{ label: '${'${title}'}', value: 'one', items, emptyLabel: 'No items' }`,
    status: `{ label: '${'${title}'}', value: 'Ready', status: 'Updated' }`,
    progress: `{ label: '${'${title}'}', progress: 64, max: 100, status: '64%' }`,
    panel: `{ label: '${'${title}'}', actionLabel: 'Open', expanded: true }`,
    canvas: `{ label: '${'${title}'}', accessibleLabel: '${'${title}'} canvas' }`,
    editor: `{ label: '${'${title}'}', actionLabel: 'Edit', value: '12 px' }`,
    shell: `{ label: '${'${title}'}', actionLabel: 'Open' }`,
    collaboration: `{ label: '${'${title}'}', items }`,
}

const foundationStoryArgs = {
    'unit-input': `{ label: 'Unit input', value: 24, min: 0, max: 100, step: 1, unit: 'px', units: [{ value: 'px', label: 'px' }, { value: '%', label: '%' }, { value: 'rem', label: 'rem' }, { value: 'vw', label: 'vw' }], unitLabel: 'Unit' }`,
    stepper: `{ label: 'Stepper', value: 24, min: 0, max: 100, step: 1, decrementLabel: 'Decrease', incrementLabel: 'Increase' }`,
    'file-picker': `{ label: 'File picker', fileLabel: 'Choose a file', fileRequirements: 'Select a file from your device' }`,
    table: `{ label: 'Table', value: 'one', items, emptyLabel: 'No items', nameLabel: 'Name', metadataLabel: 'Details' }`,
    button: `{ label: 'Button', value: 'add-section', variant: 'primary', icon: 'plus', loading: false }`,
    'split-button': `{ label: 'Split button', actionValue: 'create', menuLabel: 'More create actions', items, open: false, placement: 'bottom-start', loading: false }`,
    'toggle-button': `{ label: 'Toggle button', pressed: true, variant: 'secondary', icon: '' }`,
    'button-group': `{ label: 'Clipboard actions', orientation: 'horizontal', variant: 'secondary', items: [{ id: 'copy', label: 'Copy' }, { id: 'paste', label: 'Paste' }, { id: 'duplicate', label: 'Duplicate' }] }`,
    toolbar: `{ label: 'Toolbar', orientation: 'horizontal' }`,
    'action-bar': `{ label: 'Action bar', selectionCount: 3, busy: false, status: '3 layers selected' }`,
    shortcut: `{ keys: '⌘+Shift+P', accessibleLabel: 'Command Shift P' }`,
    'segmented-control': `{ label: 'View', value: 'one', items, orientation: 'horizontal' }`,
    tabs: `{ label: 'Workspace', value: 'one', items, orientation: 'horizontal', activation: 'automatic' }`,
    breadcrumb: `{ label: 'Breadcrumb', items, maxItems: 4, expandLabel: 'Show all breadcrumbs' }`,
    menu: `{ label: 'Menu', items, loop: true }`,
    link: `{ label: 'Documentation', href: '#documentation', target: '_self', variant: 'ghost' }`,
    pagination: `{ label: 'Results pages', page: 2, totalPages: 8, siblings: 1, previousLabel: 'Previous page', nextLabel: 'Next page', pageLabel: 'Page {page}' }`,
    'context-menu': `{ label: 'Context menu', items, open: false, x: 32, y: 32, loop: true }`,
    dropdown: `{ label: 'Dropdown', items, open: false, placement: 'bottom-start', icon: 'down' }`,
    'command-palette': `{ label: 'Command palette', items, open: false, query: '', placeholder: 'Search commands', emptyLabel: 'No commands found' }`,
    tooltip: `{ content: 'Align selected layers', placement: 'top', delay: 250, open: false }`,
    modal: `{ heading: 'Create a page', description: 'Add a page to this project.', open: false, dismissible: true, closeOnBackdrop: true, modalSize: 'md', closeLabel: 'Close' }`,
    'alert-dialog': `{ heading: 'Delete component?', description: 'This action cannot be undone.', open: false, dismissible: true, closeOnBackdrop: true, modalSize: 'sm', confirmLabel: 'Delete', cancelLabel: 'Cancel', destructive: true, busy: false }`,
    slider: `{ label: 'Opacity', value: 64, min: 0, max: 100, step: 1, valueText: '64%', orientation: 'horizontal' }`,
    select: `{ label: 'Select', value: 'desktop', placeholder: 'Choose a device', native: false, open: false, multi: false, searchable: 'auto', searchThreshold: 10, searchLabel: 'Filter options', searchPlaceholder: 'Search options', emptyLabel: 'No matching options', options: [{ value: 'desktop', label: 'Desktop' }, { value: 'tablet', label: 'Tablet' }, { value: 'mobile', label: 'Mobile' }, { value: 'watch', label: 'Watch' }, { value: 'television', label: 'Television' }, { value: 'laptop', label: 'Laptop' }, { value: 'desktop-wide', label: 'Wide desktop' }, { value: 'tablet-landscape', label: 'Landscape tablet' }, { value: 'phone-small', label: 'Small phone' }, { value: 'phone-large', label: 'Large phone' }, { value: 'kiosk', label: 'Kiosk' }] }`,
    'radio-group': `{ label: 'Publishing access', value: 'team', orientation: 'vertical', options: [{ value: 'private', label: 'Only me' }, { value: 'team', label: 'Project members' }, { value: 'public', label: 'Anyone with the link' }] }`,
    calendar: `{ label: 'Calendar', value: '2026-10-18', firstDayOfWeek: 0, min: '', max: '', previousLabel: 'Previous month', nextLabel: 'Next month' }`,
    box: `{ inlineSize: '100%', padding: '16px', background: 'var(--color-surface-muted)', radius: '8px' }`,
    row: `{ gap: '8px', align: 'center', justify: 'start', wrap: true, reverse: false, collapseAt: 'sm' }`,
    col: `{ gap: '8px', align: 'stretch', justify: 'start', reverse: false }`,
    grid: `{ columns: 'repeat(3,minmax(0,1fr))', rows: '', gap: '8px', autoFlow: 'row', align: 'stretch', justify: 'stretch' }`,
    divider: `{ orientation: 'horizontal', decorative: false }`,
    flashbar: `{ accessibleLabel: 'Notifications', position: 'top-end', maxVisible: 4, messages: [{ id: 'saved', type: 'success', heading: 'Changes saved', message: 'Your project is up to date.', dismissLabel: 'Dismiss', dismissible: true, duration: 0 }] }`,
    icon: `{ label: 'Settings', name: 'settings', size: 'md', disabled: false }`,
    'theme-provider': `{ appearance: 'system', src: '', theme: null }`,
}

const storyExtras = [
    {category:'form',name:'calendar',title:'Calendar',kind:'display',className:'Calendar'},
    {category:'form',name:'radio-group',title:'Radio group',kind:'choice',className:'RadioGroup'},
    {category:'layout',name:'box',title:'Box',kind:'panel',className:'Box'},
    {category:'layout',name:'row',title:'Row',kind:'collection',className:'Row'},
    {category:'layout',name:'col',title:'Col',kind:'collection',className:'Col'},
    {category:'layout',name:'grid',title:'Grid',kind:'collection',className:'Grid'},
    {category:'feedback',name:'flashbar',title:'Flashbar',kind:'status',className:'Flashbar'},
    {category:'media',name:'audio-player',title:'Audio player',kind:'panel',className:'AudioPlayer'},
    {category:'media',name:'video-player',title:'Video player',kind:'panel',className:'VideoPlayer'},
    {category:'icons',name:'icon',title:'Icon',kind:'display',className:'Icon'},
    {category:'theme',name:'theme-provider',title:'Theme provider',kind:'panel',className:'ThemeProvider'},
]
const reusedStoryDefinitions = reusedDefinitions.filter(reused => !definitions.some(definition => definition.name === reused.name) && reused.name !== 'icon-button')
const storyDefinitions = [...publicDefinitions, ...reusedStoryDefinitions, ...storyExtras]
const formStoryOrder = ['text-input','textarea','number-input','unit-input','combobox','checkbox','radio-group','switch','range-slider','stepper','date-picker','time-picker','file-picker','token-input','editable-label','masked-input','select','slider','calendar']
const orderDefinitions = (category, entries) => category !== 'form' ? entries : [...entries].sort((left, right) => formStoryOrder.indexOf(left.name) - formStoryOrder.indexOf(right.name))
const storyGroups = componentCategoryOrder
    .map(category => [category, orderDefinitions(category, storyDefinitions.filter(definition => definition.category === category))])
    .filter(([, entries]) => entries.length > 0 && !['media', 'charts'].includes(entries[0].category))

for (const [category, entries] of storyGroups) {
    const categoryTitle = componentCategoryTitles[category]
    const story = `import type { Meta, StoryObj } from '@storybook/web-components-vite'\nimport { componentStory } from './controls.js'\nimport '../components/${category}/index.js'\n\nconst meta: Meta = { title: '${categoryTitle}', tags: ['autodocs'], parameters: { docs: { description: { component: '${categoryTitle} components with headless bases, themed parts, standalone imports and browser bundles.' } } } }\nexport default meta\ntype Story = StoryObj\nconst items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]\n\n${entries.map(({name, title, kind, className}) => {
        const args = foundationStoryArgs[name] ?? (name === 'code-preview'
            ? `{ label: 'Code preview', code: '<cb-button label="Save"></cb-button>', codeLanguage: 'html', copyLabel: 'Copy code', copiedLabel: 'Copied' }`
            : name === 'combobox'
                ? `{ label: 'Font family', placeholder: 'Search fonts', toggleLabel: 'Toggle options', emptyLabel: 'No fonts found', open: false, autocomplete: 'list', options: [{ value: 'inter', label: 'Inter' }, { value: 'source-sans', label: 'Source Sans 3' }] }`
                : name === 'date-picker'
                    ? `{ label: '${title}', value: '2026-10-18', placeholder: 'Choose a date', previousLabel: 'Previous month', nextLabel: 'Next month', native: false, open: false, min: '', max: '' }`
                    : name === 'time-picker'
                        ? `{ label: 'Time picker', value: '09:30', placeholder: 'Choose a time', step: 1800, native: false, open: false, min: '', max: '' }`
                        : sampleByKind[kind].replaceAll('${title}', title))
        return `export const ${className}: Story = componentStory('cb-${name}', ${args})`
    }).join('\n\n')}\n`
    await writeFile(resolve('stories', `${category}.stories.ts`), story)
}

const summaryDefinitions = [...publicDefinitions, ...reusedStoryDefinitions, ...storyExtras]
    .filter(definition => !['icons', 'theme'].includes(definition.category))
const summary = summaryDefinitions.reduce((result, definition) => {
    result[definition.category] ??= []
    result[definition.category].push(definition)
    return result
}, {})
const documentationCategories = componentCategoryOrder.filter(category => summary[category])

for (const category of documentationCategories) {
    const entries = orderDefinitions(category, summary[category])
    const heading = componentCategoryTitles[category]
    const rows = entries.map(entry => `| ${entry.title} | \`<cb-${entry.name}>\` | \`@beforesemicolon/cube/${category}/${entry.name}\` |`).join('\n')
    const key = documentationKeys[category]
    const order = 20 + documentationCategories.indexOf(category)
    const categoryNote = category === 'form' ? '\n{{t.cube.formNative}}\n' : ''
    const categoryDetails = category === 'form' ? '\n\n{{t.cube.unitInputBody}}\n\n{{t.cube.selectBody}}' : ''
    const markdown = `---\nname: '{{t.cube.${key}}}'\ntitle: '{{t.cube.${key}}}'\npath: /documentation/${category}\nlayout: document\norder: ${order}\n---\n\n# {{t.cube.${key}}}\n\n{{t.cube.studioCatalogBody}}\n${categoryNote}\n:::cube studio-${category}\n:::\n\n| Component | Custom element | Package entry |\n| --- | --- | --- |\n${rows}${categoryDetails}\n\n## API\n\n{{t.cube.studioCatalogApi}}\n`
    await writeFile(resolve('docs-cube/documentation', `${category}.md`), markdown)
}

console.log(`Generated ${publicDefinitions.length} audited Studio component families and retained ${studioBoardItems.length} design references.`)
