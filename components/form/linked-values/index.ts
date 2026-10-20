import componentStylesheet from './styles.css?inline'
import { pick, or, html, type Template } from '../../core/runtime.js'

import { bool, finite } from '../../core/value.js'
import { LinkedValuesBase } from './LinkedValuesBase.js'

export class LinkedValues extends LinkedValuesBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<div part="group" role="group" aria-label="${this.accessibleName}">
            <label part="value-field first-field"><span part="value-label first-label" onclick="${() => this.focus()}">${pick(this.labelsForFields, '0')}</span>
                <cb-number-input ref="first" part="first" label="${pick(this.labelsForFields, '0')}" accessible-label="${pick(this.labelsForFields, '0')}"
                    value="${pick(this.numericValues, '0')}" min="${this.props.min}" max="${this.props.max}" step="${this.props.step}" read-only="${this.props.readOnly}"
                    disabled="${() => this.unavailable}" onchange="${(event: CustomEvent<{ value: number }>) => { event.stopPropagation(); this.setValueAt(0, finite(event.detail.value), event) }}"></cb-number-input></label>
            <cb-button part="link" exportparts="control:link-control,label:link-label,button-label:link-label,icon:link-icon,description:link-description" accessible-label="${this.toggleLabel}" title="${this.toggleLabel}" pressed="${this.props.linked}"
                icon="${() => bool(this.linked) ? 'link' : 'unlink'}" icon-only="true" variant="ghost" disabled="${or(() => this.unavailable, this.props.readOnly)}"
                onchange="${(event: CustomEvent<{ pressed: boolean }>) => { event.stopPropagation(); this.setLinked(bool(event.detail.pressed), event) }}"></cb-button>
            <label part="value-field second-field"><span part="value-label second-label" onclick="${() => { const second = this.refs.second?.[0]; if (second instanceof HTMLElement) second.focus() }}">${pick(this.labelsForFields, '1')}</span>
                <cb-number-input ref="second" part="second" label="${pick(this.labelsForFields, '1')}" accessible-label="${pick(this.labelsForFields, '1')}"
                    value="${pick(this.numericValues, '1')}" min="${this.props.min}" max="${this.props.max}" step="${this.props.step}" read-only="${this.props.readOnly}"
                    disabled="${() => this.unavailable}" onchange="${(event: CustomEvent<{ value: number }>) => { event.stopPropagation(); this.setValueAt(1, finite(event.detail.value), event) }}"></cb-number-input></label>
        </div>`
    }
    protected syncView(): void { this.syncFormValues() }
    focus(options?: FocusOptions): void { const first = this.refs.first?.[0]; if (first instanceof HTMLElement) first.focus(options) }
}
export { LinkedValuesBase };
export type { LinkedValuesProps, LinkedValuesPair, LinkedValuesInput, LinkedValuesText, LinkedValuesChangeDetail } from './LinkedValuesBase.js';
