import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { scalarText } from '../../core/value.js'
import { SidebarBase } from './SidebarBase.js'
const css = editorCSS + `
:host{display:block;inline-size:var(--component-sidebar-width,280px);min-inline-size:0;max-inline-size:100%;overflow:hidden;transition:inline-size var(--motion-duration-normal,160ms) ease-out}
:host([data-collapsed]){inline-size:var(--component-sidebar-collapsed-width,48px)}
[part~=sidebar]{box-sizing:border-box;inline-size:100%;block-size:100%;overflow:hidden;border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface)}
[part~=content]{padding:var(--spacing-md,12px)}:host([data-collapsed]) [part~=content]{display:none}
:host([data-collapsed]) [part~=header]{--component-panel-header-padding:var(--spacing-xs,4px)}
:host([data-collapsed]) [part~=header]::part(header){justify-content:center;border-block-end:0}
:host([data-collapsed]) [part~=header]::part(actions){inline-size:100%;justify-content:center}
:host([data-placement=end]) [part~=sidebar]{border-start-end-radius:0;border-end-end-radius:0}
:host([data-placement=start]) [part~=sidebar]{border-start-start-radius:0;border-end-start-radius:0}
`;
export class Sidebar extends SidebarBase {
    private collapsed(): boolean { return this.isCollapsible() && !this.isExpanded() }
    render(): Template {
        return html`<style part="styles">${css}</style>
            <aside part="sidebar panel" aria-label="${() => this.accessibleName()}">
                <cb-panel-header part="header" exportparts="header:header,heading:heading,actions:actions,toggle:toggle,toggle-control:toggle-control"
                    label="${() => this.collapsed() ? '' : scalarText(this.label)}"
                    description="${() => this.collapsed() ? '' : scalarText(this.description)}"
                    collapsible="${() => this.isCollapsible()}" expanded="${() => this.isExpanded()}"
                    expand-label="${() => this.expandLabel}" collapse-label="${() => this.collapseLabel}" disabled="${() => this.unavailable}"
                    ontoggle="${(event: Event) => { event.stopPropagation(); this.toggle(event) }}"></cb-panel-header>
                <div part="content" hidden="${() => this.collapsed()}"><slot part="content-slot"></slot></div>
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
