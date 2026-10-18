import '../panel-header/index.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import type { PanelHeader } from '../panel-header/index.js'
import { CollapsibleSidebarBase } from './CollapsibleSidebarBase.js'

export class CollapsibleSidebar extends CollapsibleSidebarBase {
    private panel?: HTMLElement
    private header?: PanelHeader
    private content?: HTMLElement
    render(): Node {
        this.panel = el('aside', 'sidebar panel')
        this.header = document.createElement('cb-panel-header') as PanelHeader
        this.header.setAttribute('part', 'header')
        this.header.setAttribute('exportparts', 'header:header,heading:heading,actions:actions,toggle:toggle,toggle-control:toggle-control')
        this.header.setAttribute('collapsible', '')
        this.header.addEventListener('cb-toggle', event => this.toggle(event))
        this.content = el('div', 'content')
        this.content.append(slot('', '', 'content-slot'))
        this.panel.append(this.header, this.content)
        return fragment(sheet(editorCSS + `
:host{display:block;inline-size:var(--component-sidebar-width,280px);min-inline-size:0;transition:inline-size var(--motion-duration-normal,160ms) ease-out}
:host(:not([expanded])){inline-size:var(--component-sidebar-collapsed-width,48px)}
[part~=sidebar]{block-size:100%;overflow:hidden;border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface)}
[part~=content]{padding:var(--spacing-md,12px)}:host(:not([expanded])) [part~=content]{display:none}
:host([data-placement=end]) [part~=sidebar]{border-start-end-radius:0;border-end-end-radius:0}
:host([data-placement=start]) [part~=sidebar]{border-start-start-radius:0;border-end-start-radius:0}
`), this.panel)
    }
    protected syncView(): void {
        if (!this.panel || !this.header || !this.content) return
        const expanded = this.isExpanded()
        this.dataset.placement = this.placement === 'end' ? 'end' : 'start'
        this.toggleAttribute('expanded', expanded)
        Object.assign(this.header, { label: scalarText(this.label), description: scalarText(this.description), collapsible: true, expanded, expandLabel: scalarText(this.expandLabel), collapseLabel: scalarText(this.collapseLabel), disabled: this.unavailable })
        this.header.setAttribute('collapsible', '')
        this.content.hidden = !expanded
        this.panel.setAttribute('aria-label', this.accessibleName())
    }
}

register('cb-collapsible-sidebar', CollapsibleSidebar)
export { CollapsibleSidebarBase }
export type { CollapsibleSidebarProps } from './CollapsibleSidebarBase.js'
