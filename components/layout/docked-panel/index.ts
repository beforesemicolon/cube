import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { DockedPanelBase } from './DockedPanelBase.js'
const css = editorCSS + `
:host{display:block;min-inline-size:0}
[part~=panel]{overflow:hidden;border:1px solid var(--color-separator);background:var(--color-surface);box-shadow:var(--component-docked-panel-shadow,-8px 0 24px color-mix(in srgb,var(--color-foreground) 10%,transparent))}
:host([data-placement=start]) [part~=panel]{border-radius:0 var(--radius-md) var(--radius-md) 0}:host([data-placement=end]) [part~=panel]{border-radius:var(--radius-md) 0 0 var(--radius-md)}:host([data-placement=bottom]) [part~=panel]{border-radius:var(--radius-md) var(--radius-md) 0 0}
[part~=content]{padding:var(--spacing-md,12px);min-block-size:120px}:host(:not([expanded])) [part~=content]{display:none}
`;
export class DockedPanel extends DockedPanelBase {
    render(): Template {
        return html`<style part="styles">${css}</style>
            <section part="panel docked-panel" aria-label="${this.accessibleName}">
                <cb-panel-header part="header" exportparts="header:header,heading:heading,actions:actions,toggle:toggle,toggle-control:toggle-control"
                    label="${this.props.label}" description="${this.props.description}"
                    collapsible="${this.isCollapsible}" expanded="${this.isExpanded}"
                    expand-label="${this.props.expandLabel}" collapse-label="${this.props.collapseLabel}" disabled="${() => this.unavailable}"
                    ontoggle="${(event: Event) => { event.stopPropagation(); this.togglePanel(event) }}"></cb-panel-header>
                <div part="content" hidden="${() => !this.isExpanded()}"><slot part="content-slot"></slot></div>
            </section>`
    }
    protected syncView(): void {
        this.dataset.placement = ['start', 'end', 'bottom'].includes(this.placement) ? this.placement : 'end'
        this.toggleAttribute('expanded', this.isExpanded())
    }
}
export { DockedPanelBase };
export type { DockedPanelProps } from './DockedPanelBase.js';
