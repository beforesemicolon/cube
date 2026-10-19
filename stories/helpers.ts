import '../components/client.js'
import { studioItemsFor, studioStatusFor, studioValueFor } from '../components/studio/presets.js'

type PreviewValue = string | number | boolean | null | object | undefined
type PreviewArgs = Record<string, PreviewValue>

export const fieldControlTags = new Set([
    'cb-text-input', 'cb-textarea', 'cb-number-input', 'cb-unit-input', 'cb-combobox', 'cb-range-slider', 'cb-stepper',
    'cb-date-picker', 'cb-time-picker', 'cb-file-picker', 'cb-token-input', 'cb-masked-input', 'cb-select', 'cb-slider',
    'cb-code-editor', 'cb-json-editor', 'cb-editable-list', 'cb-linked-values', 'cb-color-picker', 'cb-gradient-editor',
])

const fieldOwnedProperties = new Set([
    'label', 'accessibleLabel', 'description', 'helpText', 'details', 'detailsLabel', 'optionalLabel',
    'error', 'errorText', 'success', 'successText', 'disabled', 'required', 'invalid',
])

function controlArgs(args: PreviewArgs): PreviewArgs {
    return Object.fromEntries(Object.entries(args).filter(([name]) => !fieldOwnedProperties.has(name)))
}

function fieldFor(control: HTMLElement, args: PreviewArgs): HTMLElement {
    const field = document.createElement('cb-field')
    const errorText = typeof args.errorText === 'string' ? args.errorText : typeof args.error === 'string' ? args.error : ''
    Object.assign(field, {
        label: typeof args.label === 'string' ? args.label : '',
        accessibleLabel: typeof args.accessibleLabel === 'string' ? args.accessibleLabel : '',
        description: typeof args.description === 'string' ? args.description : '',
        helpText: typeof args.helpText === 'string' ? args.helpText : '',
        details: typeof args.details === 'string' ? args.details : '',
        detailsLabel: typeof args.detailsLabel === 'string' ? args.detailsLabel : '',
        optionalLabel: typeof args.optionalLabel === 'string' ? args.optionalLabel : '',
        successText: typeof args.successText === 'string' ? args.successText : '',
        errorText,
        disabled: args.disabled === true,
        required: args.required === true,
        invalid: args.invalid === true || Boolean(errorText),
        success: args.success === true,
    })
    field.append(control)
    return field
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

function artboardContent(): HTMLElement {
    const page = document.createElement('div')
    page.style.cssText = 'display:grid;grid-template-rows:auto 1fr;height:100%;background:var(--color-surface);color:var(--color-foreground);font-family:var(--typography-body-font-family)'
    const navigation = document.createElement('div')
    navigation.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--color-separator)'
    const logo = document.createElement('strong'); logo.textContent = 'Acme'
    const links = document.createElement('span'); links.textContent = 'Work · About · Contact'; links.style.cssText = 'font-size:11px;color:var(--color-muted-foreground)'
    navigation.append(logo, links)
    const hero = document.createElement('div')
    hero.style.cssText = 'display:grid;place-content:center;justify-items:start;gap:10px;padding:28px;background:linear-gradient(135deg,var(--color-surface),var(--color-selection))'
    const eyebrow = document.createElement('span'); eyebrow.textContent = 'DESIGN SYSTEM'; eyebrow.style.cssText = 'font-size:9px;font-weight:700;letter-spacing:.12em;color:var(--color-signal-text)'
    const heading = document.createElement('strong'); heading.textContent = 'Make better products.'; heading.style.cssText = 'font-size:24px;line-height:1.1'
    const copy = document.createElement('span'); copy.textContent = 'Compose accessible interfaces from production-ready building blocks.'; copy.style.cssText = 'max-width:290px;color:var(--color-muted-foreground);font-size:11px'
    hero.append(eyebrow, heading, copy, demoButton('Explore components', 'primary'))
    page.append(navigation, hero)
    return page
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
    if (name === 'select') Object.assign(node, { options: [
        { value: 'desktop', label: 'Desktop' },
        { value: 'tablet', label: 'Tablet' },
        { value: 'mobile', label: 'Mobile' },
    ], value: 'desktop' })
    if (tag === 'cb-toolbar') node.append(demoButton('Select', 'ghost'), demoButton('Move', 'ghost'), demoButton('Comment', 'ghost'))
    else if (tag === 'cb-action-bar') {
        const back = demoButton('Back', 'ghost'); back.slot = 'start'
        node.append(back)
        node.append(demoButton('Group'), demoButton('Delete', 'destructive'))
    } else if (tag === 'cb-shortcut') Object.assign(node, { keys: '⌘+Shift+P', accessibleLabel: 'Command Shift P' })
    else if (tag === 'cb-context-menu') Object.assign(node, { x: 32, y: 32 })
    else if (tag === 'cb-command-palette') Object.assign(node, { placeholder: 'Search commands' })
    else if (tag === 'cb-tooltip') {
        Object.assign(node, { content: 'Align selected layers' })
        node.append(demoButton('Hover or focus'))
    } else if (tag === 'cb-popover') {
        const trigger = demoButton('Open popover'); trigger.slot = 'trigger'; node.append(trigger, demoSurface('Popover content'))
    } else if (tag === 'cb-hover-card') {
        const trigger = demoButton('Hover or focus'); trigger.slot = 'trigger'; node.append(trigger, demoSurface('A compact preview with useful context.'))
    } else if (tag === 'cb-drawer' || tag === 'cb-bottom-sheet') {
        node.append(demoSurface(tag === 'cb-drawer' ? 'Drawer content' : 'Sheet content'))
        const footer = document.createElement('div'); footer.slot = 'footer'; footer.append(demoButton('Done', 'primary')); node.append(footer)
    } else if (tag === 'cb-modal') {
        Object.assign(node, { heading: 'Create a page', description: 'Add a page to this project.', cancelLabel: 'Cancel' })
        const form = document.createElement('div')
        form.style.cssText = 'display:grid;gap:12px;min-width:320px'
        form.append(demoSurface('Page name · Services'), demoSurface('URL path · /services'))
        node.append(form)
        const footer = document.createElement('div'); footer.slot = 'footer'; footer.append(demoButton('Create page', 'primary')); node.append(footer)
    } else if (tag === 'cb-alert-dialog') {
        Object.assign(node, { heading: 'Delete component?', description: 'This action cannot be undone.', confirmLabel: 'Delete', cancelLabel: 'Cancel', destructive: true })
    } else if (tag === 'cb-box') {
        const surface = demoSurface('Box content'); surface.style.minHeight = '96px'; node.append(surface)
    } else if (tag === 'cb-row') node.append(demoSurface('First'), demoSurface('Second'), demoSurface('Third'))
    else if (tag === 'cb-col') node.append(demoSurface('Header'), demoSurface('Content'), demoSurface('Footer'))
    else if (tag === 'cb-grid') {
        node.style.gridTemplateColumns = 'repeat(3,minmax(0,1fr))'; node.style.gap = '8px'
        node.append(demoSurface('1'), demoSurface('2'), demoSurface('3'), demoSurface('4'), demoSurface('5'), demoSurface('6'))
    } else if (tag === 'cb-sidebar') node.append(demoSurface('Pages and layers'))
    else if (tag === 'cb-resizable-panel') node.append(demoSurface('Drag the outside edge or focus it and use arrow keys.'))
    else if (tag === 'cb-docked-panel') node.append(demoSurface('Docked inspector content'))
    else if (tag === 'cb-panel-header') {
        const action = demoButton('Reset', 'ghost'); action.slot = 'actions'; node.append(action)
    } else if (tag === 'cb-field') {
        const input = document.createElement('cb-text-input')
        Object.assign(input, { label: '', accessibleLabel: 'Project name', value: 'Cube design system' })
        node.append(input)
    } else if (tag === 'cb-property-group') {
        const content = document.createElement('cb-col')
        Object.assign(content, { gap: 'sm' })
        const width = document.createElement('cb-unit-input')
        const widthProps = { label: 'Width', value: 320, unit: 'px', units: [{ value: 'px', label: 'px' }, { value: '%', label: '%' }], unitLabel: 'Unit' }
        Object.assign(width, widthProps)
        const visible = document.createElement('cb-switch')
        Object.assign(visible, { label: 'Visible', checked: true })
        content.append(fieldFor(width, widthProps), visible)
        node.append(content)
    } else if (tag === 'cb-workspace') {
        const header = document.createElement('cb-toolbar'); header.slot = 'header'
        Object.assign(header, { label: 'Editor toolbar', items: [{ id: 'select', label: 'Select', icon: 'cursor' }, { id: 'preview', label: 'Preview', icon: 'eye' }] })
        const start = demoSurface('Pages and layers'); start.slot = 'start'; start.style.cssText += ';min-height:100%;border:0;border-radius:0'
        const end = document.createElement('cb-property-group'); end.slot = 'end'
        Object.assign(end, { label: 'Layout', expanded: true, resetLabel: 'Reset layout', expandLabel: 'Expand layout', collapseLabel: 'Collapse layout' })
        const width = document.createElement('cb-unit-input')
        const widthProps = { label: 'Width', value: 320, unit: 'px', unitLabel: 'Unit' }
        Object.assign(width, widthProps); end.append(fieldFor(width, widthProps))
        const bottom = demoSurface('Timeline'); bottom.slot = 'bottom'; bottom.style.cssText += ';min-width:100%;border:0;border-radius:0'
        const canvas = demoSurface('Responsive editor canvas'); canvas.style.cssText += ';min-height:420px;border:0;border-radius:0;background:linear-gradient(90deg,var(--color-separator) 1px,transparent 1px),linear-gradient(var(--color-separator) 1px,transparent 1px);background-size:20px 20px'
        node.append(header, start, canvas, end, bottom)
    } else if (tag === 'cb-expandable-section') {
        const content = document.createElement('p')
        content.textContent = 'After you enable static website hosting, visitors can access the published content through its website endpoint.'
        content.style.cssText = 'margin:0;color:var(--color-muted-foreground);font:400 12px/1.5 var(--typography-body-font-family)'
        node.append(content)
    }
    else if (tag === 'cb-flashbar') Object.assign(node, { messages: [
        { id: 'saved', type: 'success', heading: 'Changes saved', message: 'Your project is up to date.', dismissible: true, duration: 0 },
        { id: 'publish', type: 'loading', heading: 'Publishing', message: 'Preparing the latest version.', duration: 0 },
    ] })
    else if (tag === 'cb-theme-provider') {
        const surface = demoSurface('Theme variables inherited by this content')
        surface.style.minHeight = '120px'; surface.style.padding = '24px'; node.append(surface)
    } else if (tag === 'cb-viewport') {
        const artboard = document.createElement('cb-artboard')
        Object.assign(artboard, { width: 540, height: 330, accessibleLabel: 'Homepage artboard', dimensionsLabel: '{width} × {height}', selected: true })
        artboard.append(artboardContent())
        node.append(artboard)
    } else if (tag === 'cb-artboard') {
        node.append(artboardContent())
    } else if (tag === 'cb-rulers') {
        const canvas = document.createElement('div')
        canvas.style.cssText = 'display:grid;place-items:center;width:100%;height:100%;min-height:380px;background:linear-gradient(90deg,var(--color-separator) 1px,transparent 1px),linear-gradient(var(--color-separator) 1px,transparent 1px);background-size:20px 20px'
        const card = demoSurface('Move the pointer to inspect coordinates')
        card.style.cssText += ';width:240px;height:120px;background:var(--color-surface);box-shadow:0 8px 24px color-mix(in srgb,var(--color-foreground) 12%,transparent)'
        canvas.append(card); node.append(canvas)
    } else if (tag === 'cb-device-frame') {
        const screen = document.createElement('div')
        screen.style.cssText = 'display:grid;grid-template-rows:32px 1fr;height:100%;background:var(--color-background)'
        const bar = document.createElement('div'); bar.style.cssText = 'display:flex;align-items:center;gap:6px;padding:0 10px;border-bottom:1px solid var(--color-separator);background:var(--color-surface)'
        for (const color of ['var(--color-danger)','var(--color-warning)','var(--color-success)']) { const dot=document.createElement('i'); dot.style.cssText=`width:7px;height:7px;border-radius:50%;background:${color}`; bar.append(dot) }
        const body = document.createElement('div'); body.style.cssText='display:grid;grid-template-columns:28% 1fr;gap:12px;padding:12px'
        const sidebar=demoSurface('Navigation'); const content=demoSurface('Responsive application content'); content.style.minHeight='180px'; body.append(sidebar,content)
        screen.append(bar,body); node.append(screen)
    }
}

function launchButton(label: string, action: () => void): HTMLElement {
    const button = demoButton(label, 'primary')
    button.addEventListener('action', action)
    return button
}

function wireInteraction(tag: string, node: HTMLElement, wrapper: HTMLElement): void {
    if (tag === 'cb-selection-overlay' || tag === 'cb-guide-overlay' || tag === 'cb-marquee-selection') {
        const canvas = document.createElement('div')
        canvas.style.cssText = 'position:relative;inline-size:min(100%,760px);block-size:420px;overflow:hidden;border:1px solid var(--color-separator);border-radius:var(--radius-md);background:linear-gradient(90deg,var(--color-separator) 1px,transparent 1px),linear-gradient(var(--color-separator) 1px,transparent 1px);background-size:20px 20px'
        if (tag === 'cb-marquee-selection') {
            for (const [id, left, top, width, height] of [['hero', 64, 52, 180, 110], ['copy', 298, 96, 220, 72], ['card', 174, 238, 160, 104]] as const) {
                const target = demoSurface(id)
                target.dataset.target = id
                Object.assign(target.style, { position: 'absolute', left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px`, padding: '0' })
                canvas.append(target)
            }
        } else {
            const target = demoSurface('Selected layer')
            Object.assign(target.style, { position: 'absolute', left: '96px', top: '72px', width: '240px', height: '148px', padding: '0', background: 'var(--color-surface)' })
            canvas.append(target)
        }
        canvas.append(node)
        wrapper.append(canvas)
        return
    }
    if (tag === 'cb-modal' || tag === 'cb-alert-dialog' || tag === 'cb-drawer' || tag === 'cb-bottom-sheet') {
        const labels: Record<string, string> = { 'cb-modal': 'Open modal', 'cb-alert-dialog': 'Open alert dialog', 'cb-drawer': 'Open drawer', 'cb-bottom-sheet': 'Open bottom sheet' }
        wrapper.append(launchButton(labels[tag] ?? 'Open', () => (node as HTMLElement & { show(): boolean }).show()), node)
        return
    }
    if (tag === 'cb-command-palette') {
        wrapper.append(launchButton('Open command palette', () => (node as HTMLElement & { show(): boolean }).show()), node)
        return
    }
    if (tag === 'cb-context-menu') {
        const target = demoSurface('Right-click this area')
        target.tabIndex = 0
        target.addEventListener('contextmenu', event => {
            event.preventDefault()
            ;(node as HTMLElement & { showAt(x: number, y: number): void }).showAt(event.clientX, event.clientY)
        })
        wrapper.append(target, node)
        return
    }
    wrapper.append(node)
}

export function preview(tag: string, args: PreviewArgs) {
    const wrapper = document.createElement('div'); wrapper.style.cssText = 'min-height:140px;max-width:960px;width:100%;padding:24px;box-sizing:border-box;background:var(--color-background);color:var(--color-foreground)'
    const node = document.createElement(tag); seedPreview(tag, node); Object.assign(node, fieldControlTags.has(tag) ? controlArgs(args) : args)
    const presentation = fieldControlTags.has(tag) ? fieldFor(node, args) : node
    wireInteraction(tag, presentation, wrapper)
    return wrapper
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
