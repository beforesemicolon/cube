import componentStylesheet from './styles.css?inline'
import { isNot, or, html, type Template } from '../../core/runtime.js'

import { bool, scalarText } from '../../core/value.js'
import { PropertyGroupBase } from './PropertyGroupBase.js'

export class PropertyGroup extends PropertyGroupBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`
            <cb-expandable-section part="section" exportparts="root:root,trigger:trigger,heading:heading,label:label,description:description,panel:panel,content:content,header-extras:header-extras"
                label="${this.props.label}" accessible-label="${() => scalarText(this.accessibleLabel) || this.toggleLabel()}"
                description="${this.props.description}" expanded="${this.props.expanded}"
                disabled="${or(() => this.unavailable, isNot(this.props.collapsible))}" heading-level="3"
                onexpansionchange="${(event: Event) => { event.stopPropagation(); this.toggle(event) }}">
                <span slot="header-info" part="mixed" hidden="${or(isNot(this.props.mixed), isNot(this.props.mixedLabel))}">${this.props.mixedLabel}</span>
                <cb-button slot="header-actions" part="reset" variant="ghost" icon="reset" icon-only="true"
                    accessible-label="${this.props.resetLabel}" hidden="${isNot(this.props.dirty)}"
                    disabled="${() => this.unavailable}" onaction="${(event: Event) => { event.stopPropagation(); this.reset(event) }}"></cb-button>
                <slot part="property-content"></slot>
            </cb-expandable-section>`
    }
    protected syncView(): void { this.toggleAttribute('data-dirty', bool(this.dirty)); this.toggleAttribute('data-mixed', bool(this.mixed)) }
}
export { PropertyGroupBase };
export type { PropertyGroupProps } from './PropertyGroupBase.js';
