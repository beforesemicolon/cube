import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, html, type Template } from '../../core/runtime.js'

import { DockedPanelBase } from './DockedPanelBase.js'

export class DockedPanel extends DockedPanelBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`
            <section part="panel docked-panel" aria-label="${this.accessibleName}">
                <cb-panel-header part="header" exportparts="header:header,heading:heading,actions:actions,toggle:toggle,toggle-control:toggle-control"
                    label="${this.props.label}" description="${this.props.description}"
                    collapsible="${this.isCollapsible}" expanded="${this.isExpanded}"
                    expand-label="${this.props.expandLabel}" collapse-label="${this.props.collapseLabel}" disabled="${() => this.unavailable}"
                    ontoggle="${(event: Event) => { event.stopPropagation(); this.togglePanel(event) }}"></cb-panel-header>
                <div part="content" hidden="${isNot(this.isExpanded)}"><slot part="content-slot"></slot></div>
            </section>`
    }
    protected syncView(): void {
        this.dataset.placement = ['start', 'end', 'bottom'].includes(this.placement) ? this.placement : 'end'
        this.toggleAttribute('expanded', this.isExpanded())
    }
}
export { DockedPanelBase };
export type { DockedPanelProps } from './DockedPanelBase.js';

register('cb-docked-panel', DockedPanel)
