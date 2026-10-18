export const componentCategoryOrder = [
    'action',
    'form',
    'layout',
    'navigation',
    'overlay',
    'feedback',
    'data-display',
    'media',
    'charts',
    'styling',
    'editor',
    'assets',
    'collaboration',
    'icons',
    'theme',
]

export const componentCategoryTitles = {
    action: 'Action',
    form: 'Form',
    layout: 'Layout',
    navigation: 'Navigation',
    overlay: 'Overlay',
    feedback: 'Feedback',
    'data-display': 'Data display',
    media: 'Media',
    charts: 'Charts',
    styling: 'Styling',
    editor: 'Editor',
    assets: 'Assets',
    collaboration: 'Collaboration',
    icons: 'Icons',
    theme: 'Theme',
}

const actionComponents = new Set([
    'button', 'icon-button', 'toggle-button', 'link-button', 'split-button', 'button-group', 'toolbar', 'action-bar',
    'shortcut', 'floating-toolbar', 'undo-redo', 'shortcuts',
])
const navigationComponents = new Set([
    'link', 'segmented-control', 'tabs', 'breadcrumb', 'menu', 'pagination', 'nested-menu', 'panel-tabs',
    'page-navigator', 'breakpoint-navigator', 'workspace-switcher', 'project-picker', 'device-selector', 'selection-trail', 'user-menu',
])
const overlayComponents = new Set([
    'context-menu', 'dropdown', 'command-palette', 'tooltip', 'modal', 'alert-dialog', 'popover', 'drawer', 'floating-panel',
    'hover-card', 'bottom-sheet', 'preferences', 'share-dialog', 'publish-dialog',
])
const feedbackComponents = new Set([
    'flashbar', 'status', 'empty-state', 'skeleton', 'progress', 'spinner', 'toast', 'alert', 'validation', 'banner',
    'save-status', 'publish-status',
])
const dataDisplayComponents = new Set([
    'badge', 'avatar', 'card', 'list', 'description-row', 'property-row', 'table', 'tree', 'accordion', 'stat', 'code-preview',
    'activity-log',
])
const layoutComponents = new Set([
    'inspector', 'collapsible-sidebar', 'resizable-panel', 'docked-panel', 'panel-header', 'top-bar', 'inspector-sidebar',
    'asset-sidebar', 'status-bar',
])
const editorComponents = new Set(['properties-inspector', 'property-group', 'design-code', 'version-history'])
const mediaComponents = new Set(['media-preview'])

export function resolveComponentCategory(sourceCategory, name) {
    if (componentCategoryOrder.includes(sourceCategory)) return sourceCategory
    if (sourceCategory === 'actions') {
        if (actionComponents.has(name)) return 'action'
        if (navigationComponents.has(name)) return 'navigation'
        if (overlayComponents.has(name)) return 'overlay'
    }
    if (sourceCategory === 'inputs') return 'form'
    if (sourceCategory === 'color-style') return 'styling'
    if (sourceCategory === 'data-feedback') return feedbackComponents.has(name) ? 'feedback' : 'data-display'
    if (sourceCategory === 'overlays') {
        if (actionComponents.has(name)) return 'action'
        if (navigationComponents.has(name)) return 'navigation'
        if (layoutComponents.has(name)) return 'layout'
        if (feedbackComponents.has(name)) return 'feedback'
        return 'overlay'
    }
    if (sourceCategory === 'canvas' || sourceCategory === 'advanced-editors') return 'editor'
    if (sourceCategory === 'assets-structure') {
        if (actionComponents.has(name)) return 'action'
        if (navigationComponents.has(name)) return 'navigation'
        if (mediaComponents.has(name)) return 'media'
        if (editorComponents.has(name)) return 'editor'
        return 'assets'
    }
    if (sourceCategory === 'app-shell') {
        if (actionComponents.has(name)) return 'action'
        if (navigationComponents.has(name)) return 'navigation'
        if (layoutComponents.has(name)) return 'layout'
        if (overlayComponents.has(name)) return 'overlay'
        if (feedbackComponents.has(name)) return 'feedback'
        return 'editor'
    }
    if (sourceCategory === 'collaboration-ai') return 'collaboration'
    if (sourceCategory === 'layout' || sourceCategory === 'media' || sourceCategory === 'charts' || sourceCategory === 'icons' || sourceCategory === 'theme') return sourceCategory
    throw new Error(`No component category for ${sourceCategory}/${name}`)
}
