import componentStylesheet from './styles.css?inline'
import { html, type Template } from '../../core/runtime.js'

import { scalarText } from '../../core/value.js'
import { SidebarBase } from './SidebarBase.js'

export class Sidebar extends SidebarBase {
    stylesheet = componentStylesheet

    private collapsed = (): boolean => { return this.isCollapsible() && !this.isExpanded() }
    render(): Template {
        return html`
            <aside part="sidebar panel" aria-label="${this.accessibleName}">
                <cb-panel-header part="header" exportparts="header:header,heading:heading,actions:actions,toggle:toggle,toggle-control:toggle-control"
                    label="${() => this.collapsed() ? '' : scalarText(this.label)}"
                    description="${() => this.collapsed() ? '' : scalarText(this.description)}"
                    collapsible="${this.isCollapsible}" expanded="${this.isExpanded}"
                    expand-label="${this.props.expandLabel}" collapse-label="${this.props.collapseLabel}" disabled="${() => this.unavailable}"
                    ontoggle="${(event: Event) => { event.stopPropagation(); this.toggle(event) }}"></cb-panel-header>
                <div part="content" hidden="${this.collapsed}"><slot part="content-slot"></slot></div>
            </aside>`
    }
    protected syncView(): void {
        this.dataset.placement = this.placement === 'end' ? 'end' : 'start'
        this.toggleAttribute('collapsible', this.isCollapsible())
        if (this.isCollapsible()) this.toggleAttribute('expanded', this.isExpanded())
        this.toggleAttribute('data-collapsed', this.collapsed())
    }
}
export { SidebarBase };
export type { SidebarProps } from './SidebarBase.js';
