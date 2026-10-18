import '../panel-header/index.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { scalarText } from '../../core/value.js'
import type { PanelHeader } from '../panel-header/index.js'
import { SidebarBase } from './SidebarBase.js'

export class Sidebar extends SidebarBase {
    private panel?: HTMLElement
    private header?: PanelHeader
    private content?: HTMLElement

    render(): Node {
        this.panel = el('aside', 'sidebar panel')
        this.header = document.createElement('cb-panel-header') as PanelHeader
        this.header.setAttribute('part', 'header')
        this.header.setAttribute('exportparts', 'header:header,heading:heading,actions:actions,toggle:toggle,toggle-control:toggle-control')
        this.header.addEventListener('cb-toggle', event => this.toggle(event))
        this.content = el('div', 'content')
        this.content.append(slot('', '', 'content-slot'))
        this.panel.append(this.header, this.content)
        return fragment(sheet(editorCSS + `
:host{display:block;inline-size:var(--component-sidebar-width,280px);min-inline-size:0;max-inline-size:100%;overflow:hidden;transition:inline-size var(--motion-duration-normal,160ms) ease-out}
:host([data-collapsed]){inline-size:var(--component-sidebar-collapsed-width,48px)}
[part~=sidebar]{box-sizing:border-box;inline-size:100%;block-size:100%;overflow:hidden;border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface)}
[part~=content]{padding:var(--spacing-md,12px)}:host([data-collapsed]) [part~=content]{display:none}
:host([data-collapsed]) [part~=header]{--component-panel-header-padding:var(--spacing-xs,4px)}
:host([data-collapsed]) [part~=header]::part(header){justify-content:center;border-block-end:0}
:host([data-collapsed]) [part~=header]::part(actions){inline-size:100%;justify-content:center}
:host([data-placement=end]) [part~=sidebar]{border-start-end-radius:0;border-end-end-radius:0}
:host([data-placement=start]) [part~=sidebar]{border-start-start-radius:0;border-end-start-radius:0}
`), this.panel)
    }

    protected syncView(): void {
        if (!this.panel || !this.header || !this.content) return
        const collapsible = this.isCollapsible()
        const expanded = this.isExpanded()
        const collapsed = collapsible && !expanded
        this.dataset.placement = this.placement === 'end' ? 'end' : 'start'
        this.toggleAttribute('collapsible', collapsible)
        if (collapsible) this.toggleAttribute('expanded', expanded)
        this.toggleAttribute('data-collapsed', collapsed)
        Object.assign(this.header, {
            label: collapsed ? '' : scalarText(this.label),
            description: collapsed ? '' : scalarText(this.description),
            collapsible,
            expanded,
            expandLabel: scalarText(this.expandLabel),
            collapseLabel: scalarText(this.collapseLabel),
            disabled: this.unavailable,
        })
        this.header.toggleAttribute('collapsible', collapsible)
        this.header.toggleAttribute('expanded', expanded)
        this.content.hidden = collapsed
        this.panel.setAttribute('aria-label', this.accessibleName())
    }
}

register('cb-sidebar', Sidebar)
export { SidebarBase }
export type { SidebarProps } from './SidebarBase.js'
