import { aria, editorCSS, el, fragment, sheet, slot, uid } from '../core/editor-dom.js'
import { scalarText } from '../core/value.js'
import { createIcon } from '../icons/paths.js'
import { actionLabel, createButton, createIconButton } from '../action/create.js'
import type { Button } from '../action/button/index.js'
import type { Select } from '../form/select/index.js'
import type { UnitInputBase } from '../form/unit-input/UnitInputBase.js'
import type { StudioComponentBase } from './StudioComponentBase.js'
import type { StudioItem, StudioValue } from './types.js'

export interface StudioView {
    root: DocumentFragment
    control?: HTMLElement
    update(): void
}

const studioCSS = editorCSS + `
:host{inline-size:var(--component-studio-inline-size,auto);min-inline-size:0;container-type:inline-size}
:host([data-kind=text]),:host([data-kind=textarea]),:host([data-kind=number]),:host([data-kind=search]),:host([data-kind=select]),:host([data-kind=range]),:host([data-kind=file]),:host([data-kind=color]),:host([data-kind=tokens]){inline-size:var(--component-studio-control-width,320px)}
:host([data-kind=collection]),:host([data-kind=collaboration]),:host([data-kind=status]),:host([data-kind=progress]),:host([data-kind=display]),:host([data-kind=panel]),:host([data-kind=editor]){inline-size:var(--component-studio-panel-width,360px)}
:host([data-kind=canvas]),:host([data-kind=shell]){inline-size:var(--component-studio-canvas-width,520px)}
[part~=root]{display:grid;gap:var(--spacing-xs,4px);min-inline-size:0}
[part~=label-row]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px);min-inline-size:0}
[part~=body]{min-inline-size:0}
[part~=control]{inline-size:100%;min-inline-size:0}
textarea[part~=control]{min-block-size:calc(var(--cb-height) * 2.4);resize:vertical}
[part~=choice]{display:inline-flex;align-items:center;gap:var(--spacing-sm,8px);min-block-size:var(--cb-height);cursor:pointer}
[part~=choice] [part~=control]{inline-size:16px;min-block-size:16px;padding:0;accent-color:var(--color-primary)}
[part~=list]{display:grid;gap:2px;margin:0;padding:var(--spacing-xs,4px);list-style:none;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);max-block-size:240px;overflow:auto}
[part~=item]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px);inline-size:100%;text-align:start;border-color:transparent;background:transparent}
[part~=item-main]{display:flex;align-items:center;gap:var(--spacing-sm,8px);min-inline-size:0}
[part~=item-copy]{display:grid;gap:1px;min-inline-size:0}
[part~=item-description]{margin-inline-start:auto;white-space:nowrap}
[part~=item-icon]{inline-size:16px;block-size:16px;color:var(--color-muted-foreground);flex:none}
[part~=item][aria-selected=true],[part~=item][aria-pressed=true]{background:var(--color-selection);border-color:var(--color-primary)}
[part~=list][data-layout=segmented]{display:flex;gap:0;padding:0;border:0;background:transparent;overflow:visible}
[part~=list][data-layout=segmented] [part~=item]{justify-content:center;min-inline-size:52px;border-color:var(--color-border);border-radius:0;margin-inline-start:-1px}
[part~=list][data-layout=segmented] [part~=item]:first-child{margin-inline-start:0;border-start-start-radius:var(--radius-sm);border-end-start-radius:var(--radius-sm)}
[part~=list][data-layout=segmented] [part~=item]:last-child{border-start-end-radius:var(--radius-sm);border-end-end-radius:var(--radius-sm)}
[part~=list][data-layout=trail]{display:flex;align-items:center;gap:4px;padding:0;border:0;background:transparent;overflow:auto}
[part~=list][data-layout=trail] [part~=item]{inline-size:auto;padding-inline:4px}
[part~=separator]{color:var(--color-muted-foreground)}
[part~=list][data-layout=table]{padding:0;gap:0;border-radius:var(--radius-sm);overflow:hidden}
[part~=table-header],[part~=list][data-layout=table] [part~=item]{display:grid;grid-template-columns:minmax(100px,1fr) minmax(120px,1.2fr);gap:12px;min-block-size:30px;align-items:center;padding:4px 10px;border:0;border-block-end:1px solid var(--color-separator);border-radius:0}
[part~=table-header]{background:var(--color-surface-muted);font-size:11px;font-weight:650;color:var(--color-muted-foreground)}
[part~=list][data-layout=tree] [part~=item]{justify-content:flex-start}
[part~=list][data-layout=tree] [part~=item]:nth-of-type(n+3){padding-inline-start:28px}
[part~=list][data-layout=grid]{grid-template-columns:repeat(3,minmax(72px,1fr));gap:8px;padding:8px;max-block-size:none}
[part~=list][data-layout=grid] [part~=item]{display:grid;justify-items:start;gap:8px;min-block-size:82px;padding:10px;border-color:var(--color-separator);background:var(--color-surface-muted)}
[part~=list][data-layout=grid] [part~=item-icon]{inline-size:28px;block-size:28px;color:var(--color-primary)}
[part~=list][data-layout=presence]{display:flex;align-items:center;gap:0;padding:8px;overflow:visible}
[part~=list][data-layout=presence] [part~=item]{position:relative;display:grid;place-items:center;inline-size:30px;min-inline-size:30px;block-size:30px;min-block-size:30px;margin-inline-start:-6px;padding:0;border:2px solid var(--color-surface);border-radius:50%;background:var(--color-selection);color:var(--color-signal-text);font-weight:700}
[part~=list][data-layout=presence] [part~=item]:first-child{margin-inline-start:0}
[part~=panel],[part~=shell],[part~=canvas],[part~=display],[part~=editor],[part~=collaboration]{border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);padding:var(--spacing-md,12px);min-inline-size:0}
[part~=panel-header]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px);padding-block-end:var(--spacing-sm,8px);border-block-end:1px solid var(--color-separator)}
[part~=content]{display:block;min-block-size:var(--cb-height);padding-block:var(--spacing-sm,8px)}
[part~=canvas]{position:relative;display:grid;place-items:center;aspect-ratio:var(--component-canvas-aspect-ratio,16/9);overflow:hidden;background-color:var(--color-surface-muted);background-image:linear-gradient(var(--color-separator) 1px,transparent 1px),linear-gradient(90deg,var(--color-separator) 1px,transparent 1px);background-size:16px 16px}
[part~=canvas-stage]{position:relative;inline-size:76%;block-size:66%;border:1px solid var(--color-separator);background:var(--color-surface);box-shadow:0 4px 14px color-mix(in srgb,var(--color-foreground) 12%,transparent)}
[part~=canvas-marker]{position:absolute;inset:24% 20%;border:1px solid var(--color-primary);background:color-mix(in srgb,var(--color-selection) 70%,transparent);border-radius:2px}
[part~=handle]{position:absolute;inline-size:7px;block-size:7px;border:1px solid var(--color-primary);background:var(--color-surface);border-radius:1px}
[part~=handle]:nth-child(2){inset:-4px auto auto -4px}[part~=handle]:nth-child(3){inset:-4px -4px auto auto}[part~=handle]:nth-child(4){inset:auto auto -4px -4px}[part~=handle]:nth-child(5){inset:auto -4px -4px auto}
[part~=guide]{position:absolute;background:var(--color-danger);opacity:.85}[part~=guide][data-axis=x]{inset:50% 0 auto;block-size:1px}[part~=guide][data-axis=y]{inset:0 auto 0 50%;inline-size:1px}
[part~=cursor-label]{position:absolute;inset:22% auto auto 58%;padding:2px 6px;border-radius:3px;background:var(--color-primary);color:var(--color-primary-foreground);font-size:10px}
[part~=cursor-icon]{position:absolute;inset:34% auto auto 53%;color:var(--color-primary);inline-size:20px;block-size:20px}
[part~=meter]{inline-size:100%;accent-color:var(--color-primary)}
[part~=swatch]{inline-size:var(--cb-height);block-size:var(--cb-height);border-radius:var(--radius-sm);border:1px solid var(--color-border);background:var(--cb-studio-color,transparent);flex:none}
[part~=token]{display:inline-flex;align-items:center;gap:var(--spacing-xs,4px);border:1px solid var(--color-border);border-radius:999px;padding:2px var(--spacing-sm,8px);background:var(--color-surface-muted)}
cb-button[part~=token]{border:0;padding:0;background:transparent}cb-button[part~=token]::part(token-control){min-block-size:24px;border-radius:999px;padding:2px var(--spacing-sm,8px)}
[part~=token-list]{display:flex;flex-wrap:wrap;gap:var(--spacing-xs,4px)}
[part~=status]{min-block-size:1lh}
[part~=error]{font-size:var(--component-caption-font-size,11px);color:var(--color-danger);margin:0}
:host([data-invalid]) [part~=control],:host([data-invalid]) [part~=field-shell],:host([data-invalid]) [part~=panel]{border-color:var(--color-danger)}
[part~=status-card]{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:start;min-inline-size:min(320px,100%)}
[part~=status-icon]{inline-size:20px;block-size:20px;color:var(--color-primary)}
[part~=status-title]{font-weight:650}[part~=status-copy]{color:var(--color-muted-foreground);font-size:11px}
[part~=empty-illustration]{display:grid;place-items:center;inline-size:42px;block-size:42px;border-radius:10px;background:var(--color-selection);color:var(--color-primary)}
[part~=skeleton-line]{display:block;block-size:8px;border-radius:999px;background:var(--color-track);margin-block:5px}[part~=skeleton-line]:last-child{inline-size:68%}
[part~=spinner-ring]{display:inline-block;inline-size:22px;block-size:22px;border:2px solid var(--color-track);border-inline-end-color:var(--color-primary);border-radius:50%;animation:cb-studio-spin .8s linear infinite}
[part~=field-shell]{display:flex;align-items:stretch;min-inline-size:180px}
[part~=field-shell] [part~=control]{border-radius:var(--radius-sm) 0 0 var(--radius-sm)}
[part~=field-shell][part~=stepper]{isolation:isolate}
[part~=field-shell][part~=stepper] > *{position:relative}
[part~=field-shell][part~=stepper] > * + *{margin-inline-start:-1px}
[part~=field-shell][part~=stepper] [part~=control]{flex:1;text-align:center;border-radius:0;appearance:textfield}
[part~=field-shell][part~=stepper] [part~=control]::-webkit-inner-spin-button,[part~=field-shell][part~=stepper] [part~=control]::-webkit-outer-spin-button{margin:0;appearance:none}
[part~=field-shell][part~=stepper] [part~=stepper-button]{display:block;flex:none;inline-size:var(--cb-height);min-inline-size:var(--cb-height)}
[part~=field-shell][part~=stepper] [part~=decrement-button]{--component-button-radius-start-start:var(--radius-sm);--component-button-radius-start-end:0;--component-button-radius-end-end:0;--component-button-radius-end-start:var(--radius-sm)}
[part~=field-shell][part~=stepper] [part~=increment-button]{--component-button-radius-start-start:0;--component-button-radius-start-end:var(--radius-sm);--component-button-radius-end-end:var(--radius-sm);--component-button-radius-end-start:0}
[part~=field-shell][part~=stepper] > :hover{z-index:1}
[part~=field-shell][part~=stepper] > :focus-within{z-index:2}
:host([data-invalid]) [part~=field-shell][part~=stepper] [part~=control],:host([data-invalid]) [part~=decrement-button]::part(decrement-button-control),:host([data-invalid]) [part~=increment-button]::part(increment-button-control){border-color:var(--color-danger)}
[part~=field-affix]{display:grid;place-items:center;min-inline-size:42px;padding-inline:8px;border:1px solid var(--color-border);border-inline-start:0;border-radius:0 var(--radius-sm) var(--radius-sm) 0;background:var(--color-surface-muted);color:var(--color-muted-foreground)}
[part~=unit-select]{--component-select-width:auto;display:block;inline-size:auto;min-inline-size:58px;flex:none}
[part~=unit-select]::part(field){display:block;block-size:100%}
[part~=unit-select]::part(label),[part~=unit-select]::part(description),[part~=unit-select]::part(error),[part~=unit-select]::part(native){display:none}
[part~=unit-select]::part(trigger){block-size:100%;min-block-size:var(--cb-height);padding-inline:8px;border-inline-start:0;border-start-start-radius:0;border-end-start-radius:0;background:var(--color-surface-muted);color:var(--color-muted-foreground)}
[part~=unit-select]::part(popup){inset-inline-start:auto;min-inline-size:max(100%,88px)}
[part~=field-affix][data-side=start]{border-inline:1px solid var(--color-border);border-inline-end:0;border-radius:var(--radius-sm) 0 0 var(--radius-sm)}
[part~=field-shell][data-prefix] [part~=control]{border-radius:0 var(--radius-sm) var(--radius-sm) 0}
[part~=suggestions]{margin-block-start:4px}
[part~=switch-track]{position:relative;inline-size:32px;block-size:18px;border-radius:999px;background:var(--color-track);transition:background-color var(--motion-duration-fast) ease-out}
[part~=switch-thumb]{position:absolute;inset:2px auto 2px 2px;inline-size:14px;border-radius:50%;background:var(--color-surface);box-shadow:0 1px 3px color-mix(in srgb,var(--color-foreground) 24%,transparent);transition:translate var(--motion-duration-fast) ease-out}
[part~=choice-control]:checked + [part~=switch-track]{background:var(--color-primary)}[part~=choice-control]:checked + [part~=switch-track] [part~=switch-thumb]{translate:14px 0}
[part~=choice-control].visual-control{position:absolute;opacity:0;pointer-events:none}
[part~=dropzone]{display:grid;place-items:center;gap:6px;min-inline-size:280px;min-block-size:104px;padding:16px;border:1px dashed var(--color-border);border-radius:var(--radius-md);background:var(--color-surface-muted);text-align:center;cursor:pointer}
[part~=dropzone-icon]{inline-size:22px;block-size:22px;color:var(--color-primary)}
[part~=editor-grid]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;min-inline-size:min(320px,100%)}
[part~=editor-field]{display:grid;gap:3px}[part~=editor-field-label]{font-size:10px;color:var(--color-muted-foreground)}[part~=editor-field-value]{min-block-size:28px;padding:5px 8px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-muted)}
[part~=preview-block]{display:grid;place-items:center;min-block-size:86px;border:1px solid var(--color-separator);border-radius:var(--radius-sm);background:var(--color-surface-muted);color:var(--color-muted-foreground)}
[part~=panel-toolbar]{display:flex;align-items:center;gap:4px;padding:4px;border:1px solid var(--color-separator);border-radius:var(--radius-sm);background:var(--color-surface-muted)}
[part~=panel-toolbar] [part~=tool]{min-inline-size:56px}[part~=panel-toolbar] [part~=tool]::part(tool-control){inline-size:100%}
[part~=card-media]{min-block-size:96px;background:var(--color-selection);color:var(--color-signal-text)}
[part~=shell-bar]{display:flex;align-items:center;justify-content:space-between;gap:8px;min-inline-size:min(520px,100%)}
[part~=shell-group]{display:flex;align-items:center;gap:6px}
@keyframes cb-studio-spin{to{rotate:1turn}}
@container (max-width:360px){[part~=label-row],[part~=panel-header]{align-items:stretch;flex-direction:column}[part~=action]{inline-size:100%}}
`

function selected(host: StudioComponentBase, item: StudioItem): boolean {
    if (Array.isArray(host.value)) return host.value.includes(item.id)
    return String(host.value ?? '') === String(item.value ?? item.id) || item.selected === true
}

const segmentedCollections = new Set([
    'segmented-control', 'tabs', 'flex-direction', 'flex-alignment', 'position', 'anchor', 'overflow',
    'alignment', 'design-code', 'panel-tabs', 'constraints',
])
const trailCollections = new Set(['breadcrumb', 'selection-trail'])
const gridCollections = new Set([
    'component-browser', 'asset-manager', 'image-browser', 'font-browser', 'icon-browser', 'page-navigator',
    'symbol-library', 'variants',
])

function collectionLayout(name: string): 'default' | 'segmented' | 'trail' | 'table' | 'tree' | 'grid' | 'presence' {
    if (segmentedCollections.has(name)) return 'segmented'
    if (trailCollections.has(name)) return 'trail'
    if (name === 'table') return 'table'
    if (name === 'tree' || name === 'layer-tree') return 'tree'
    if (gridCollections.has(name)) return 'grid'
    if (name === 'presence') return 'presence'
    return 'default'
}

function iconFor(name: string, itemId: string): string {
    if (name.includes('layer') || itemId === 'page') return 'layers'
    if (name.includes('image') || itemId === 'hero' || itemId === 'mountain' || itemId === 'portrait') return 'image'
    if (name.includes('icon')) return itemId in { search: 1, settings: 1, layers: 1, comment: 1 } ? itemId : 'component'
    if (name.includes('font')) return 'text'
    if (name.includes('history')) return 'reset'
    if (name.includes('comment') || itemId === 'comment') return 'comment'
    if (name.includes('component') || name.includes('symbol') || name === 'variants') return 'component'
    if (itemId === 'delete') return 'close'
    if (itemId === 'duplicate') return 'copy'
    return 'file'
}

function initials(label: string): string {
    return label.split(/\s+/).map(part => part.charAt(0)).join('').slice(0, 2).toUpperCase()
}

type StudioTextKey = 'nameLabel' | 'metadataLabel' | 'unitLabel' | 'decrementLabel' | 'incrementLabel' | 'fileLabel' | 'fileRequirements'
function componentText(host: StudioComponentBase, key: StudioTextKey): string {
    return scalarText((host as StudioComponentBase & Partial<Record<StudioTextKey, string>>)[key])
}

function studioAction(host: StudioComponentBase, part: string, label: string, item?: StudioItem): Button {
    const control = createButton(part, event => host.activate(item, event))
    actionLabel(control, label)
    control.disabled = host.studioDisabled() || item?.disabled === true
    return control
}

function listView(host: StudioComponentBase, role: 'listbox' | 'tree' = 'listbox'): { node: HTMLElement; update: () => void } {
    const node = el('div', 'list collection')
    node.setAttribute('role', role)
    const layout = collectionLayout(host.componentName)
    node.dataset.layout = layout
    const activeElement = (): Element | null => {
        const root = node.getRootNode()
        return root instanceof ShadowRoot ? root.activeElement : node.ownerDocument.activeElement
    }
    const update = (): void => {
        const active = activeElement()
        const activeId = active instanceof HTMLElement ? active.dataset.itemId : ''
        node.replaceChildren()
        const items = host.studioItems()
        if (!items.length) {
            const empty = el('span', 'empty', host.studioEmptyLabel())
            empty.setAttribute('role', 'status')
            node.append(empty)
            return
        }
        if (layout === 'table') {
            const header = el('div', 'table-header')
            header.append(el('span', 'table-heading', componentText(host, 'nameLabel')), el('span', 'table-heading', componentText(host, 'metadataLabel')))
            node.append(header)
        }
        for (const item of items) {
            const button = el('button', 'item row')
            button.type = 'button'
            button.dataset.itemId = item.id
            button.disabled = host.studioDisabled() || item.disabled === true
            button.setAttribute('role', role === 'tree' ? 'treeitem' : 'option')
            aria(button, 'aria-selected', selected(host, item))
            if (layout === 'presence') {
                button.textContent = initials(item.label)
                button.title = item.description ? `${item.label} — ${item.description}` : item.label
                button.setAttribute('aria-label', button.title)
            } else {
                const main = el('span', 'item-main')
                if (layout === 'grid' || layout === 'tree' || ['menu', 'nested-menu', 'canvas-menu', 'activity-log'].includes(host.componentName)) {
                    main.append(createIcon(iconFor(host.componentName, item.id), 'item-icon icon'))
                }
                const copy = el('span', 'item-copy')
                copy.append(el('span', 'item-label', item.label))
                main.append(copy)
                button.append(main)
                if (layout === 'trail' && item !== items.at(-1)) button.append(el('span', 'separator', '›'))
                else if (item.description) button.append(el('span', 'item-description description', item.description))
            }
            button.addEventListener('click', event => host.activate(item, event))
            node.append(button)
        }
        const restore = activeId ? node.querySelector<HTMLElement>(`[data-item-id="${CSS.escape(activeId)}"]`) : null
        if (restore) restore.focus({ preventScroll: true })
    }
    node.addEventListener('keydown', event => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
        const controls = [...node.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
        if (!controls.length) return
        const current = controls.indexOf(activeElement() as HTMLButtonElement)
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : event.key === 'ArrowDown' ? (current + 1 + controls.length) % controls.length : (current - 1 + controls.length) % controls.length
        event.preventDefault()
        controls[next]?.focus()
    })
    return { node, update }
}

function editorField(label: string, value: string): HTMLElement {
    const field = el('div', 'editor-field')
    field.append(el('span', 'editor-field-label', label), el('span', 'editor-field-value', value))
    return field
}

function createEditorContent(host: StudioComponentBase): HTMLElement {
    const content = el('div', 'editor-content')
    if (host.componentName === 'gradient-editor') {
        const preview = el('div', 'preview-block gradient-preview', host.studioTextValue())
        preview.style.background = 'linear-gradient(90deg,var(--color-primary),#8b5cf6)'
        preview.style.color = 'var(--color-primary-foreground)'
        content.append(preview)
    }
    const grid = el('div', 'editor-grid')
    const items = host.studioItems()
    if (items.length) for (const item of items) grid.append(editorField(item.label, item.description ?? String(item.value ?? '')))
    else grid.append(editorField(host.studioLabel(), host.studioTextValue()))
    content.append(grid)
    return content
}

function displayContent(host: StudioComponentBase): HTMLElement {
    const content = el('div', 'display-content')
    const value = host.studioTextValue() || host.studioLabel()
    if (host.componentName === 'badge') {
        const badge = el('span', 'token badge', value); badge.setAttribute('role', 'status'); content.append(badge)
    } else if (host.componentName === 'avatar') {
        const avatar = el('span', 'empty-illustration avatar', initials(value)); avatar.setAttribute('role', 'img'); avatar.setAttribute('aria-label', value); content.append(avatar, el('span', 'item-label', value))
    } else if (host.componentName.includes('preview') || host.componentName.includes('thumbnail')) {
        content.append(el('div', 'preview-block', value))
    } else if (host.componentName === 'diff-preview') {
        for (const [index, item] of host.studioItems().entries()) {
            const change = el('div', 'editor-field-value', item.description ? `${item.label}: ${item.description}` : item.label)
            change.style.color = index === 0 ? 'var(--color-danger)' : 'var(--color-success)'
            content.append(change)
        }
    } else {
        const items = host.studioItems()
        if (items.length) for (const item of items) content.append(editorField(item.label, item.description ?? String(item.value ?? '')))
        else content.append(editorField(host.studioLabel(), value))
    }
    return content
}

function shellContent(host: StudioComponentBase): HTMLElement {
    const bar = el('div', 'shell-bar')
    const primary = el('div', 'shell-group')
    const secondary = el('div', 'shell-group')
    const items = host.studioItems()
    if (host.componentName === 'top-bar') {
        primary.append(createIcon('component', 'icon'), el('strong', 'shell-title', host.studioLabel()), el('span', 'description', host.studioStatus()))
        for (const item of items.slice(0, 2)) secondary.append(studioAction(host, 'action', item.label, item))
    } else if (host.componentName === 'status-bar') {
        for (const item of items.slice(0, 2)) primary.append(el('span', 'description', item.label))
        secondary.append(el('span', 'description', host.studioTextValue()))
    } else {
        primary.append(createIcon('layers', 'icon'), el('strong', 'shell-title', host.studioLabel()))
        secondary.append(studioAction(host, 'action', host.studioActionLabel()))
    }
    bar.append(primary, secondary)
    return bar
}

function panelContent(host: StudioComponentBase): HTMLElement {
    const content = el('div', 'panel-content')
    const items = host.studioItems()
    if (host.componentName === 'floating-toolbar') {
        const toolbar = el('div', 'panel-toolbar'); toolbar.setAttribute('role', 'toolbar'); toolbar.setAttribute('aria-label', host.studioAccessibleName())
        for (const item of items) {
            toolbar.append(studioAction(host, 'tool', item.label, item))
        }
        content.append(toolbar)
    } else if (host.componentName === 'card') {
        content.append(el('div', 'preview-block card-media', host.studioTextValue()))
        for (const item of items) content.append(editorField(item.label, item.description ?? String(item.value ?? '')))
    } else {
        if (items.length) {
            const grid = el('div', 'editor-grid')
            for (const item of items) grid.append(editorField(item.label, item.description ?? String(item.value ?? '')))
            content.append(grid)
        } else content.append(el('div', 'preview-block', host.studioTextValue() || host.studioDescription()))
    }
    return content
}

export function createStudioView(host: StudioComponentBase): StudioView {
    const root = el('div', `root ${host.componentName}`)
    root.dataset.component = host.componentName
    const labelRow = el('div', 'label-row row')
    const label = el('label', 'label')
    const status = el('span', 'status')
    status.setAttribute('role', 'status')
    labelRow.append(label, status)
    const body = el('div', 'body')
    const description = el('p', 'description')
    description.id = uid(`cb-${host.componentName}-description`)
    description.dataset.cbDescription = ''
    const error = el('p', 'error')
    error.id = uid(`cb-${host.componentName}-error`)
    error.setAttribute('role', 'alert')
    root.append(labelRow, body, description, error)
    let control: HTMLElement | undefined
    let updateBody = (): void => {}

    const bindTextControl = (node: HTMLInputElement | HTMLTextAreaElement): void => {
        control = node
        const id = uid(`cb-${host.componentName}`)
        node.id = id
        node.addEventListener('change', event => host.setValue(node instanceof HTMLInputElement && node.type === 'number' ? node.valueAsNumber : node.value, event))
        updateBody = (): void => {
            const value = host.studioTextValue()
            if (node.value !== value) node.value = value
            node.placeholder = host.studioPlaceholder()
            node.disabled = host.studioDisabled()
            node.readOnly = host.studioReadOnly()
            node.required = host.studioRequired()
            node.setAttribute('aria-label', host.studioAccessibleName())
        }
        if (host.componentName === 'unit-input') {
            const unitHost = host as UnitInputBase
            const shell = el('div', 'field-shell')
            const unit = el('span', 'field-affix unit unit-static')
            unit.setAttribute('aria-hidden', 'true')
            const unitSelect = document.createElement('cb-select') as Select
            unitSelect.setAttribute('part', 'unit unit-select')
            unitSelect.addEventListener('cb-change', event => {
                event.stopPropagation()
                const detail = (event as CustomEvent<{ value: string | string[]; originalEvent?: Event }>).detail
                const selectedUnit = Array.isArray(detail.value) ? detail.value[0] ?? '' : detail.value
                unitHost.chooseUnit(selectedUnit, detail.originalEvent ?? event)
            })
            shell.append(node, unit, unitSelect)
            body.append(shell)
            const originalUpdate = updateBody
            updateBody = (): void => {
                originalUpdate()
                const options = unitHost.normalizedUnits
                const selectedUnit = unitHost.selectedUnit
                const selectedOption = options.find(option => option.value === selectedUnit)
                const visibleUnit = selectedOption?.label ?? selectedUnit
                const interactive = options.length > 1
                unit.textContent = visibleUnit
                unit.hidden = interactive || !visibleUnit
                unitSelect.hidden = !interactive
                unitSelect.options = [...options]
                unitSelect.value = selectedUnit
                unitSelect.accessibleLabel = componentText(host, 'unitLabel')
                unitSelect.disabled = unitHost.studioDisabled()
                unitSelect.readOnly = unitHost.studioReadOnly()
                if (visibleUnit && node instanceof HTMLInputElement) node.setAttribute('aria-valuetext', `${node.value} ${visibleUnit}`)
                else node.removeAttribute('aria-valuetext')
            }
        } else if (host.componentName === 'stepper') {
            const shell = el('div', 'field-shell stepper')
            const decrement = createIconButton('decrement-button', 'minus', event => {
                const next = Math.max(host.studioNumber('min'), Number(node.value || 0) - host.studioNumber('step'))
                host.setValue(next, event)
            })
            const increment = createIconButton('increment-button', 'plus', event => {
                const next = Math.min(host.studioNumber('max'), Number(node.value || 0) + host.studioNumber('step'))
                host.setValue(next, event)
            })
            decrement.setAttribute('part', 'stepper-button decrement-button')
            increment.setAttribute('part', 'stepper-button increment-button')
            decrement.variant = 'secondary'
            increment.variant = 'secondary'
            shell.append(decrement, node, increment)
            body.append(shell)
            const originalUpdate = updateBody
            updateBody = (): void => {
                originalUpdate()
                const unavailable = host.studioDisabled() || host.studioReadOnly()
                const value = Number(node.value || 0)
                decrement.disabled = unavailable || value <= host.studioNumber('min')
                increment.disabled = unavailable || value >= host.studioNumber('max')
                actionLabel(decrement, componentText(host, 'decrementLabel'))
                actionLabel(increment, componentText(host, 'incrementLabel'))
            }
        } else if (host.componentKind === 'search') {
            const shell = el('div', 'field-shell search-shell'); shell.dataset.prefix = ''
            const prefix = el('span', 'field-affix'); prefix.dataset.side = 'start'; prefix.append(createIcon('search', 'icon'))
            shell.append(prefix, node); body.append(shell)
            if (host.componentName === 'combobox' || host.componentName === 'autocomplete') {
                const suggestions = listView(host)
                suggestions.node.setAttribute('part', 'suggestions list collection')
                body.append(suggestions.node)
                const originalUpdate = updateBody
                updateBody = (): void => { originalUpdate(); suggestions.update(); suggestions.node.hidden = !host.studioOpen() }
            }
        } else body.append(node)
    }

    if (host.componentKind === 'text' || host.componentKind === 'search' || host.componentKind === 'number') {
        const input = el('input', 'control input')
        input.type = host.componentKind === 'number' ? 'number' : host.componentName === 'date-picker' ? 'date' : host.componentName === 'time-picker' ? 'time' : host.componentKind === 'search' ? 'search' : 'text'
        bindTextControl(input)
        const baseUpdate = updateBody
        updateBody = (): void => {
            baseUpdate()
            if (host.componentKind === 'number') {
                input.min = String(host.studioNumber('min'))
                input.max = String(host.studioNumber('max'))
                input.step = String(host.studioNumber('step'))
            }
            if (host.componentName === 'combobox' || host.componentName === 'autocomplete') {
                input.setAttribute('role', 'combobox')
                input.setAttribute('aria-autocomplete', host.componentName === 'autocomplete' ? 'both' : 'list')
                aria(input, 'aria-expanded', host.studioOpen())
            }
        }
    } else if (host.componentKind === 'textarea') {
        bindTextControl(el('textarea', 'control textarea'))
    } else if (host.componentKind === 'select') {
        const select = el('select', 'control select')
        control = select
        select.addEventListener('change', event => host.setValue(host.studioMultiple() ? [...select.selectedOptions].map(option => option.value) : select.value, event))
        updateBody = (): void => {
            select.replaceChildren()
            for (const item of host.studioItems()) {
                const option = document.createElement('option')
                option.setAttribute('part', 'option')
                option.value = String(item.value ?? item.id)
                option.textContent = item.label
                option.disabled = item.disabled === true
                option.selected = selected(host, item)
                select.append(option)
            }
            select.multiple = host.studioMultiple()
            select.required = host.studioRequired()
            select.disabled = host.studioDisabled()
            select.setAttribute('aria-label', host.studioAccessibleName())
        }
        body.append(select)
    } else if (host.componentKind === 'choice') {
        const wrapper = el('label', 'choice')
        const input = el('input', 'control choice-control')
        input.type = host.componentName.includes('radio') ? 'radio' : 'checkbox'
        control = input
        const choiceLabel = el('span', 'choice-label')
        input.addEventListener('change', event => host.setValue(input.checked, event))
        updateBody = (): void => {
            input.checked = host.studioChecked() || host.value === true
            input.disabled = host.studioDisabled()
            input.required = host.studioRequired()
            input.setAttribute('aria-label', host.studioAccessibleName())
            if (host.componentName.includes('switch')) input.setAttribute('role', 'switch')
            choiceLabel.textContent = host.studioLabel()
        }
        if (host.componentName.includes('switch')) {
            input.classList.add('visual-control')
            const track = el('span', 'switch-track')
            track.append(el('span', 'switch-thumb'))
            wrapper.append(input, track, choiceLabel)
        } else wrapper.append(input, choiceLabel)
        body.append(wrapper)
    } else if (host.componentKind === 'range') {
        const input = el('input', 'control range')
        input.type = 'range'
        control = input
        input.addEventListener('input', event => host.setValue(input.valueAsNumber, event))
        updateBody = (): void => {
            input.min = String(host.studioNumber('min'))
            input.max = String(host.studioNumber('max'))
            input.step = String(host.studioNumber('step'))
            input.value = host.studioTextValue() || String(host.studioNumber('min'))
            input.disabled = host.studioDisabled()
            input.setAttribute('aria-label', host.studioAccessibleName())
        }
        body.append(input)
    } else if (host.componentKind === 'file') {
        const input = el('input', 'control file')
        input.type = 'file'
        control = input
        input.addEventListener('change', event => host.setValue(input.files?.[0]?.name ?? '', event))
        updateBody = (): void => { input.disabled = host.studioDisabled() || host.studioReadOnly(); input.required = host.studioRequired(); input.multiple = host.studioMultiple(); input.setAttribute('aria-label', host.studioAccessibleName()) }
        input.hidden = true
        const dropzone = el('label', 'dropzone control')
        dropzone.append(createIcon('upload', 'dropzone-icon icon'), el('strong', 'dropzone-title', componentText(host, 'fileLabel')), el('span', 'description', componentText(host, 'fileRequirements')), input)
        body.append(dropzone)
    } else if (host.componentKind === 'color') {
        const row = el('div', 'row color-row')
        const swatch = el('span', 'swatch')
        const input = el('input', 'control color-value')
        input.type = host.componentName === 'color-picker' || host.componentName === 'eyedropper' ? 'color' : 'text'
        control = input
        input.addEventListener('change', event => host.setValue(input.value, event))
        updateBody = (): void => {
            const value = host.studioTextValue() || '#2563eb'
            if (input.type !== 'color' || /^#[\da-f]{6}$/i.test(value)) input.value = value
            swatch.style.setProperty('--cb-studio-color', value)
            input.disabled = host.studioDisabled()
            input.readOnly = host.studioReadOnly()
            input.setAttribute('aria-label', host.studioAccessibleName())
        }
        row.append(swatch, input)
        body.append(row)
    } else if (host.componentKind === 'tokens') {
        const list = el('div', 'token-list')
        updateBody = (): void => {
            list.replaceChildren()
            for (const item of host.studioItems()) {
                const token = studioAction(host, 'token', item.label, item)
                token.setAttribute('part', 'token item')
                list.append(token)
            }
            if (!list.childElementCount) list.append(el('span', 'empty', host.studioEmptyLabel()))
        }
        body.append(list)
    } else if (host.componentKind === 'collection' || host.componentKind === 'collaboration') {
        const list = listView(host, host.componentName.includes('tree') || host.componentName.includes('layer') ? 'tree' : 'listbox')
        if (host.componentKind === 'collaboration') list.node.setAttribute('part', 'collaboration list')
        body.append(list.node)
        updateBody = list.update
        control = list.node
    } else if (host.componentKind === 'status' || host.componentKind === 'progress') {
        const display = el('div', 'display status-display')
        display.dataset.component = host.componentName
        const card = el('div', 'status-card')
        const copy = el('div', 'status-content')
        const output = el('output', 'value status-title')
        const supporting = el('div', 'status-copy')
        let meter: HTMLProgressElement | undefined
        if (host.componentName === 'skeleton') {
            copy.append(el('span', 'skeleton-line'), el('span', 'skeleton-line'), el('span', 'skeleton-line'))
            card.append(copy)
        } else if (host.componentName === 'spinner') {
            card.append(el('span', 'spinner-ring'), output)
        } else {
            const iconName = host.componentName === 'empty-state' ? 'folder' : host.componentName === 'alert' || host.componentName === 'validation' || host.componentName === 'conflict' ? 'warning' : host.componentName.includes('publish') || host.componentName.includes('save') ? 'check' : host.componentName === 'toast' || host.componentName === 'banner' ? 'info' : 'bolt'
            const icon = host.componentName === 'empty-state' ? el('span', 'empty-illustration') : el('span', 'status-icon')
            icon.append(createIcon(iconName, 'icon'))
            copy.append(output, supporting)
            card.append(icon, copy)
        }
        if (host.componentKind === 'progress' && host.componentName !== 'spinner') { meter = el('progress', 'meter'); display.append(card, meter) }
        else display.append(card)
        updateBody = (): void => {
            const value = host.studioTextValue()
            output.value = value || host.studioLabel()
            supporting.textContent = host.studioStatus()
            supporting.hidden = !supporting.textContent
            if (meter) { meter.max = host.studioNumber('max'); meter.value = host.studioNumber('progress') }
        }
        body.append(display)
    } else if (host.componentKind === 'canvas') {
        const canvas = el('div', 'canvas control')
        canvas.dataset.component = host.componentName
        canvas.tabIndex = 0
        canvas.setAttribute('role', 'region')
        const stage = el('div', 'canvas-stage')
        const marker = el('span', 'canvas-marker')
        if (['selection-box', 'resize-handle', 'multi-selection', 'component-outline', 'viewport', 'artboard'].includes(host.componentName)) {
            marker.append(el('span', 'handle'), el('span', 'handle'), el('span', 'handle'), el('span', 'handle'))
        }
        if (['smart-guides', 'snap-lines', 'alignment-guide', 'spacing-measure', 'grid-overlay'].includes(host.componentName)) {
            const horizontal = el('span', 'guide'); horizontal.dataset.axis = 'x'
            const vertical = el('span', 'guide'); vertical.dataset.axis = 'y'
            stage.append(horizontal, vertical)
        }
        if (host.componentName === 'remote-cursor' || host.componentName === 'cursor') {
            stage.append(createIcon('cursor', 'cursor-icon icon'), el('span', 'cursor-label', host.studioTextValue() || host.studioLabel()))
        } else if (host.componentName === 'comment-pin') {
            const pin = el('span', 'cursor-label', '1'); pin.append(createIcon('comment', 'icon')); stage.append(pin)
        } else stage.append(marker)
        canvas.append(stage)
        canvas.addEventListener('keydown', event => {
            if (!['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) return
            event.preventDefault()
            host.emit('cb-nudge', { direction: event.key, originalEvent: event })
        })
        canvas.addEventListener('click', event => host.activate(undefined, event))
        updateBody = (): void => { canvas.setAttribute('aria-label', host.studioAccessibleName()); aria(canvas, 'aria-disabled', host.studioDisabled() ? true : null); canvas.tabIndex = host.studioDisabled() ? -1 : 0 }
        body.append(canvas)
        control = canvas
    } else {
        const region = el('section', `${host.componentKind} panel`)
        region.dataset.component = host.componentName
        const header = el('header', 'panel-header')
        const heading = el('span', 'panel-title')
        const action = createButton('action', event => host.activate(undefined, event))
        const suppliedContent = slot('', '', 'content')
        const generatedContent = el('div', 'generated-content')
        const content = el('div', 'content composed-content')
        const renderGeneratedContent = (): HTMLElement => host.componentKind === 'editor'
            ? createEditorContent(host)
            : host.componentKind === 'display'
                ? displayContent(host)
                : host.componentKind === 'shell'
                    ? shellContent(host)
                    : panelContent(host)
        content.append(generatedContent, suppliedContent)
        header.append(heading, action)
        region.append(header, content)
        updateBody = (): void => {
            generatedContent.replaceChildren(renderGeneratedContent())
            heading.textContent = host.studioLabel()
            actionLabel(action, host.studioActionLabel())
            action.disabled = host.studioDisabled()
            action.hidden = !host.actionLabel
            aria(region, 'aria-label', host.studioAccessibleName())
            region.toggleAttribute('data-open', host.studioOpen())
            region.toggleAttribute('data-expanded', host.studioExpanded())
        }
        body.append(region)
        control = region
    }

    const update = (): void => {
        host.dataset.kind = host.componentKind
        host.dataset.orientation = host.orientation === 'vertical' ? 'vertical' : 'horizontal'
        host.toggleAttribute('data-invalid', host.studioInvalid())
        label.textContent = host.studioLabel()
        label.hidden = ['choice','display','panel','editor','shell'].includes(host.componentKind) || !host.label
        status.textContent = host.studioStatus()
        status.hidden = !host.studioStatus()
        description.textContent = host.studioDescription()
        description.hidden = !host.studioDescription()
        error.textContent = host.studioError()
        error.hidden = !host.studioError()
        updateBody()
        if (control) {
            if (!control.id) control.id = uid(`cb-${host.componentName}-control`)
            if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) label.htmlFor = control.id
            aria(control, 'aria-describedby', host.studioDescription() ? description.id : null)
            aria(control, 'aria-errormessage', host.studioError() ? error.id : null)
            aria(control, 'aria-invalid', host.studioInvalid() ? true : null)
            aria(control, 'aria-readonly', host.studioReadOnly() ? true : null)
            if (host.componentKind === 'collection' || host.componentKind === 'collaboration') aria(control, 'aria-label', host.studioAccessibleName())
        }
    }
    return { root: fragment(sheet(studioCSS), root), control, update }
}

export type { StudioItem, StudioValue }
