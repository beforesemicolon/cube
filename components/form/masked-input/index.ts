import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { html, type Template } from '../../core/runtime.js'

import { scalarText } from '../../core/value.js'
import { MaskedInputBase, formatMaskedValue, unmaskValue } from './MaskedInputBase.js'

export class MaskedInput extends MaskedInputBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`
            <input ref="input" part="control input" type="text" value="${this.formattedValue}" placeholder="${this.maskGuide}"
                disabled="${() => this.unavailable}" readonly="${this.props.readOnly}" required="${this.props.required}"
                inputmode="${() => scalarText(this.inputMode, 'text')}" autocomplete="${() => scalarText(this.autocomplete, 'off')}"
                aria-label="${this.accessibleName}" aria-description="${() => scalarText(this.description) || null}"
                aria-invalid="${() => (this.validationShown ? this.validationMessage : scalarText(this.errorText)) ? 'true' : null}"
                oninput="${(event: Event) => {
                    const input = event.currentTarget
                    if (!(input instanceof HTMLInputElement)) return
                    const accepted = this.setValue(input.value, event)
                    input.value = this.formattedValue()
                    if (accepted) queueMicrotask(() => input.setSelectionRange(input.value.length, input.value.length))
                }}">
            `
    }
    protected fieldElement(): HTMLInputElement | undefined {
        const node = this.refs.input?.[0]
        return node instanceof HTMLInputElement ? node : undefined
    }
}
export { MaskedInputBase, formatMaskedValue, unmaskValue };
export type { MaskedInputProps } from './MaskedInputBase.js';

register('cb-masked-input', MaskedInput)
