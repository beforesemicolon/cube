import componentStylesheet from './styles.css?inline'
import { when, is, isNot, html, type Template } from '../../core/runtime.js'

import { PanelHeaderBase } from './PanelHeaderBase.js'

export class PanelHeader extends PanelHeaderBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`
            <header part="header">
                <div part="copy"><slot name="heading" part="heading">${this.props.label}</slot>
                    <p part="description" hidden="${isNot(this.props.description)}">${this.props.description}</p></div>
                <div part="actions"><slot name="actions" part="action-content"></slot>
                    <cb-button part="toggle" exportparts="control:toggle-control" variant="ghost" icon="down" icon-only="true"
                        hidden="${isNot(this.isCollapsible)}" disabled="${() => this.unavailable}"
                        aria-expanded="${when(is(() => this.isExpanded()), 'true', 'false')}" accessible-label="${this.toggleText}"
                        onbeforeaction="${(event: Event) => event.stopPropagation()}"
                        onaction="${(event: Event) => { event.stopPropagation(); this.toggleExpanded(event) }}"></cb-button>
                </div>
            </header>`
    }
    protected syncView(): void {
        this.toggleAttribute('collapsible', this.isCollapsible())
        this.toggleAttribute('expanded', this.isExpanded())
    }
}
export { PanelHeaderBase };
export type { PanelHeaderProps } from './PanelHeaderBase.js';
