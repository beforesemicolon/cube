import '../panel-header/index.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import type { PanelHeader } from '../panel-header/index.js'
import { DockedPanelBase } from './DockedPanelBase.js'

export class DockedPanel extends DockedPanelBase {
    private panel?: HTMLElement
    private header?: PanelHeader
    private content?: HTMLElement
    render(): Node {
        this.panel = el('section', 'panel docked-panel')
        this.header = document.createElement('cb-panel-header') as PanelHeader
        this.header.setAttribute('part', 'header')
        this.header.setAttribute('exportparts', 'header:header,heading:heading,actions:actions,toggle:toggle,toggle-control:toggle-control')
        this.header.addEventListener('toggle', event => { event.stopPropagation(); this.togglePanel(event) })
        this.content = el('div', 'content')
        this.content.append(slot('', '', 'content-slot'))
        this.panel.append(this.header, this.content)
        return fragment(sheet(editorCSS + `
:host{display:block;min-inline-size:0}
[part~=panel]{overflow:hidden;border:1px solid var(--color-separator);background:var(--color-surface);box-shadow:var(--component-docked-panel-shadow,-8px 0 24px color-mix(in srgb,var(--color-foreground) 10%,transparent))}
:host([data-placement=start]) [part~=panel]{border-radius:0 var(--radius-md) var(--radius-md) 0}:host([data-placement=end]) [part~=panel]{border-radius:var(--radius-md) 0 0 var(--radius-md)}:host([data-placement=bottom]) [part~=panel]{border-radius:var(--radius-md) var(--radius-md) 0 0}
[part~=content]{padding:var(--spacing-md,12px);min-block-size:120px}:host(:not([expanded])) [part~=content]{display:none}
`), this.panel)
    }
    protected syncView(): void {
        if (!this.panel || !this.header || !this.content) return
        const expanded = this.isExpanded()
        const placement = ['start', 'end', 'bottom'].includes(this.placement) ? this.placement : 'end'
        this.dataset.placement = placement
        this.toggleAttribute('expanded', expanded)
        Object.assign(this.header, { label: scalarText(this.label), description: scalarText(this.description), collapsible: this.isCollapsible(), expanded, expandLabel: scalarText(this.expandLabel), collapseLabel: scalarText(this.collapseLabel), disabled: this.unavailable })
        this.header.toggleAttribute('collapsible', this.isCollapsible())
        this.content.hidden = !expanded
        this.panel.setAttribute('aria-label', this.accessibleName())
    }
}

register('cb-docked-panel', DockedPanel)
export { DockedPanelBase }
export type { DockedPanelProps } from './DockedPanelBase.js'
