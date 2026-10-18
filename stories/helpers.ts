import '../components/client.js'
import { studioBoardItems, studioDefinitions } from '../components/studio/catalog.js'
import { studioItemsFor, studioStatusFor, studioValueFor } from '../components/studio/presets.js'

const designedComponents = new Set(studioBoardItems.map(item => item.name))
const singleStateComponents = new Set([
    'context-menu', 'command-palette', 'tooltip', 'modal', 'alert-dialog', 'popover', 'drawer', 'bottom-sheet',
    'floating-panel', 'hover-card', 'inspector', 'collapsible-sidebar', 'resizable-panel', 'docked-panel',
])
const studioKinds = new Map<string, string>(studioDefinitions.map(definition => [definition.name, definition.kind]))
const textStateKinds = new Set(['text', 'textarea', 'number', 'search', 'select', 'file', 'color', 'tokens'])

function stateNames(name: string, matrix: boolean): readonly string[] {
    if (!matrix) return ['Preview']
    const kind = studioKinds.get(name)
    if (name === 'button' || name === 'link-button' || name === 'split-button' || name === 'icon-button') return ['Default', 'Hover', 'Focus', 'Pressed', 'Disabled', 'Loading']
    if (name.includes('switch')) return ['Off', 'On', 'Focus', 'Loading', 'Disabled']
    if (name === 'viewport') return ['Idle', 'Panning', 'Zoomed']
    if (textStateKinds.has(kind ?? '') || ['select', 'slider'].includes(name)) return ['Empty', 'Filled', 'Focus', 'Invalid', 'Disabled', 'Read only']
    if (kind === 'choice' || ['toggle-button'].includes(name)) return ['Off', 'On', 'Focus', 'Disabled']
    if (kind === 'collection' || kind === 'collaboration' || ['button-group', 'segmented-control', 'tabs', 'breadcrumb', 'menu'].includes(name)) return ['Default', 'Selected', 'Empty', 'Disabled']
    return ['Default', 'Focus', 'Disabled']
}

function demoSurface(label: string): HTMLElement {
    const surface = document.createElement('div')
    surface.textContent = label
    surface.style.cssText = 'display:grid;place-items:center;min-width:72px;min-height:48px;padding:12px;border:1px solid var(--color-separator);border-radius:var(--radius-sm);background:var(--color-surface-muted);color:var(--color-foreground);font:500 12px/1.4 var(--typography-body-font-family)'
    return surface
}

function demoButton(label: string, variant = 'secondary'): HTMLElement {
    const button = document.createElement('cb-button')
    Object.assign(button, { label, variant })
    return button
}

function seedPreview(tag: string, node: HTMLElement): void {
    const name = tag.startsWith('cb-') ? tag.slice(3) : tag
    const items = studioItemsFor(name, [])
    const value = studioValueFor(name, '')
    const status = studioStatusFor(name)
    if (items.length) Object.assign(node, { items, value: items[0]?.value ?? items[0]?.id ?? '' })
    if (value) Object.assign(node, { value })
    if (status) Object.assign(node, { status })
    if (name === 'button') Object.assign(node, { label: 'Add section', variant: 'primary', icon: 'plus' })
    if (name === 'icon-button') Object.assign(node, { label: 'More actions', accessibleLabel: 'More actions', icon: 'settings', variant: 'ghost' })
    if (name === 'select') Object.assign(node, { options: [
        { value: 'desktop', label: 'Desktop' },
        { value: 'tablet', label: 'Tablet' },
        { value: 'mobile', label: 'Mobile' },
    ], value: 'desktop' })
    if (name === 'combobox' || name === 'autocomplete') Object.assign(node, { open: true })
    if (name === 'multi-select') Object.assign(node, { multiple: true, value: ['design', 'prototype'] })
    if (tag === 'cb-button-group') node.append(demoButton('Copy'), demoButton('Paste'), demoButton('Duplicate'))
    else if (tag === 'cb-toolbar') node.append(demoButton('Select', 'ghost'), demoButton('Move', 'ghost'), demoButton('Comment', 'ghost'))
    else if (tag === 'cb-action-bar') {
        Object.assign(node, { status: '3 layers selected' })
        node.append(demoButton('Group'), demoButton('Delete', 'destructive'))
    } else if (tag === 'cb-shortcut') Object.assign(node, { keys: '⌘+Shift+P', accessibleLabel: 'Command Shift P' })
    else if (tag === 'cb-context-menu') Object.assign(node, { open: true, x: 32, y: 32 })
    else if (tag === 'cb-command-palette') Object.assign(node, { open: true, placeholder: 'Search commands' })
    else if (tag === 'cb-tooltip') {
        Object.assign(node, { open: true, content: 'Align selected layers' })
        node.append(demoButton('Hover or focus'))
    } else if (tag === 'cb-modal') {
        Object.assign(node, { open: true, heading: 'Create a page', description: 'Add a page to this project.' })
        const form = document.createElement('div')
        form.style.cssText = 'display:grid;gap:12px;min-width:320px'
        form.append(demoSurface('Page name · Services'), demoSurface('URL path · /services'))
        node.append(form)
        const footer = document.createElement('div'); footer.slot = 'footer'; footer.append(demoButton('Cancel'), demoButton('Create page', 'primary')); node.append(footer)
    } else if (tag === 'cb-alert-dialog') {
        Object.assign(node, { open: true, heading: 'Delete component?', description: 'This action cannot be undone.', confirmLabel: 'Delete', cancelLabel: 'Cancel', destructive: true })
    } else if (tag === 'cb-box') {
        const surface = demoSurface('Box content'); surface.style.minHeight = '96px'; node.append(surface)
    } else if (tag === 'cb-row') node.append(demoSurface('First'), demoSurface('Second'), demoSurface('Third'))
    else if (tag === 'cb-col') node.append(demoSurface('Header'), demoSurface('Content'), demoSurface('Footer'))
    else if (tag === 'cb-grid') {
        node.style.gridTemplateColumns = 'repeat(3,minmax(0,1fr))'; node.style.gap = '8px'
        node.append(demoSurface('1'), demoSurface('2'), demoSurface('3'), demoSurface('4'), demoSurface('5'), demoSurface('6'))
    } else if (tag === 'cb-flashbar') Object.assign(node, { messages: [
        { id: 'saved', type: 'success', heading: 'Changes saved', message: 'Your project is up to date.', dismissible: true, duration: 0 },
        { id: 'publish', type: 'loading', heading: 'Publishing', message: 'Preparing the latest version.', duration: 0 },
    ] })
    else if (tag === 'cb-theme-provider') {
        const surface = demoSurface('Theme variables inherited by this content')
        surface.style.minHeight = '120px'; surface.style.padding = '24px'; node.append(surface)
    }
}

export function preview(tag: string, args: Record<string, unknown>, appearance: string) {
    const provider = document.createElement('cb-theme-provider')
    Object.assign(provider, { appearance })
    const wrapper = document.createElement('div'); wrapper.style.cssText = 'min-height:140px;max-width:960px;width:100%;padding:24px;box-sizing:border-box;background:var(--color-background);color:var(--color-foreground)'
    const name = tag.startsWith('cb-') ? tag.slice(3) : tag
    const matrix = designedComponents.has(name) && !singleStateComponents.has(name)
    const states = stateNames(name, matrix)
    const gallery = document.createElement('div')
    gallery.style.cssText = matrix ? 'display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;align-items:start' : 'display:block'
    for (const state of states) {
        const example = document.createElement('section')
        example.style.cssText = 'display:grid;gap:8px;min-width:0'
        if (matrix) {
            const caption = document.createElement('span'); caption.textContent = state
            caption.style.cssText = 'color:var(--color-muted-foreground);font:600 10px/1.4 var(--typography-body-font-family);letter-spacing:.08em;text-transform:uppercase'
            example.append(caption)
        }
        const node = document.createElement(tag); Object.assign(node, args); seedPreview(tag, node)
        if (state === 'Focus') node.dataset.demoState = 'focus'
        if (state === 'Hover') node.dataset.demoState = 'hover'
        if (state === 'Pressed') node.dataset.demoState = 'pressed'
        if (state === 'Panning') node.dataset.demoState = 'panning'
        if (state === 'Zoomed') node.dataset.demoState = 'zoomed'
        if (state === 'Empty') Object.assign(node, name === 'select' ? { value: '' } : { value: '', checked: false, items: [] })
        if (state === 'Invalid') Object.assign(node, { invalid: true, error: 'Enter a valid value.', errorText: 'Enter a valid value.' })
        if (state === 'Read only') Object.assign(node, { readOnly: true })
        if (state === 'Off') Object.assign(node, { checked: false, value: false })
        if (state === 'On') Object.assign(node, { checked: true, value: true })
        if (state === 'Loading') Object.assign(node, { loading: true, disabled: true, status: 'Saving…' })
        if (state === 'Selected') {
            const selected = studioItemsFor(name, [])[1]
            if (selected) Object.assign(node, { value: selected.value ?? selected.id })
        }
        if (state === 'Disabled') Object.assign(node, { disabled: true })
        example.append(node); gallery.append(example)
    }
    const style = document.createElement('style')
    style.textContent = '[data-demo-state=focus]::part(control),[data-demo-state=focus]::part(item),[data-demo-state=focus]::part(panel),[data-demo-state=focus]::part(canvas){outline:2px solid var(--color-focus);outline-offset:2px}[data-demo-state=hover]::part(control){filter:brightness(.94)}[data-demo-state=pressed]::part(control){filter:brightness(.88);translate:0 1px}[data-demo-state=panning]::part(canvas-stage){translate:12px 6px}[data-demo-state=zoomed]::part(canvas-stage){scale:1.14}'
    wrapper.append(style, gallery); provider.append(wrapper)
    return provider
}
export function silentAudio(seconds = 4): string {
    const samples = Math.round(8000 * seconds), data = new Uint8Array(44 + samples * 2), view = new DataView(data.buffer)
    const write = (at: number, value: string) => [...value].forEach((c, i) => data[at + i] = c.charCodeAt(0))
    write(0, 'RIFF'); view.setUint32(4, data.length-8, true); write(8, 'WAVE'); write(12, 'fmt ')
    view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,8000,true)
    view.setUint32(28,16000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,samples*2,true)
    let binary=''; for (const byte of data) binary+=String.fromCharCode(byte)
    return `data:audio/wav;base64,${btoa(binary)}`
}
