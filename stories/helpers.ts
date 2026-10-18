import '../components/client.js'
import { studioItemsFor, studioStatusFor, studioValueFor } from '../components/studio/presets.js'

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
    if (name === 'multi-select') Object.assign(node, { multiple: true, value: ['design', 'prototype'] })
    if (tag === 'cb-toolbar') node.append(demoButton('Select', 'ghost'), demoButton('Move', 'ghost'), demoButton('Comment', 'ghost'))
    else if (tag === 'cb-action-bar') {
        Object.assign(node, { status: '3 layers selected' })
        node.append(demoButton('Group'), demoButton('Delete', 'destructive'))
    } else if (tag === 'cb-shortcut') Object.assign(node, { keys: '⌘+Shift+P', accessibleLabel: 'Command Shift P' })
    else if (tag === 'cb-context-menu') Object.assign(node, { x: 32, y: 32 })
    else if (tag === 'cb-command-palette') Object.assign(node, { placeholder: 'Search commands' })
    else if (tag === 'cb-tooltip') {
        Object.assign(node, { content: 'Align selected layers' })
        node.append(demoButton('Hover or focus'))
    } else if (tag === 'cb-modal') {
        Object.assign(node, { heading: 'Create a page', description: 'Add a page to this project.' })
        const form = document.createElement('div')
        form.style.cssText = 'display:grid;gap:12px;min-width:320px'
        form.append(demoSurface('Page name · Services'), demoSurface('URL path · /services'))
        node.append(form)
        const footer = document.createElement('div'); footer.slot = 'footer'; footer.append(demoButton('Cancel'), demoButton('Create page', 'primary')); node.append(footer)
    } else if (tag === 'cb-alert-dialog') {
        Object.assign(node, { heading: 'Delete component?', description: 'This action cannot be undone.', confirmLabel: 'Delete', cancelLabel: 'Cancel', destructive: true })
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
    const node = document.createElement(tag); seedPreview(tag, node); Object.assign(node, args)
    wrapper.append(node); provider.append(wrapper)
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
