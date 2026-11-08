import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, is, or, html, repeat, state, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { RadioGroupBase } from './RadioGroupBase.js'

export class RadioGroup extends RadioGroupBase {
    stylesheet = componentStylesheet

    private readonly internalName = uid('cb-radio-group')
    private readonly optionRevision = state(0)
    private optionList = () => {
        this.optionRevision[0]()
        return this.normalizedOptions
    }
    private validationError = (): string => { return (this.validationShown || text(this.errorText)) ? this.validationMessage || text(this.errorText) : '' }
    render(): Template {
        return html`<div part="field">
            <span part="label" id="${this.internalName}-label" hidden="${isNot(this.props.label)}">${this.props.label}</span>
            <div part="group options" role="radiogroup" data-stacked="${() => bool(this.stacked) ? '' : null}"
                aria-labelledby="${() => text(this.label) ? this.internalName + '-label' : null}"
                aria-label="${() => text(this.label) ? null : this.accessibleName()}"
                aria-required="${() => bool(this.required) ? 'true' : null}" aria-readonly="${() => bool(this.readOnly) ? 'true' : null}"
                aria-invalid="${() => this.validationError() ? 'true' : null}"
                aria-describedby="${() => [text(this.description) ? this.internalName + '-description' : '', this.validationError() ? this.internalName + '-error' : ''].filter(Boolean).join(' ') || null}">
                ${repeat(this.optionList, option => html`<label part="option" data-disabled="${() => option.disabled || this.unavailable || bool(this.readOnly) ? '' : null}">
                    <input ref="input" part="control radio" type="radio" name="${this.internalName}" value="${option.value}"
                        checked="${is(() => this.selection, option.value)}" disabled="${or(option.disabled, () => this.unavailable, this.props.readOnly)}"
                        required="${this.props.required}" aria-label="${option.label}" aria-description="${() => option.description || null}"
                        onchange="${(event: Event) => { const input = event.currentTarget; if (input instanceof HTMLInputElement && input.checked) this.choose(input.value, event) }}">
                    <span part="option-copy">
                        <span part="option-label">${option.label}</span>
                        <span part="option-description description" hidden="${isNot(option.description)}">${option.description}</span>
                    </span>
                </label>`, { key: option => option.value })}
            </div>
            <p part="description" id="${this.internalName}-description" hidden="${isNot(this.props.description)}">${this.props.description}</p>
            <p part="error" role="alert" id="${this.internalName}-error" hidden="${isNot(this.validationError)}">${this.validationError}</p>
        </div>`
    }
    protected fieldElement(): HTMLInputElement | undefined {
        return this.refs.input?.find((node): node is HTMLInputElement => node instanceof HTMLInputElement)
    }
    protected update(name: string): void {
        if (name === 'options') queueMicrotask(() => {
            if (this.isConnected) this.optionRevision[1](this.optionRevision[0]() + 1)
        })
        super.update(name)
    }
    focus(options?: FocusOptions): void {
        const inputs = this.refs.input?.filter((node): node is HTMLInputElement => node instanceof HTMLInputElement) ?? []
        ;(inputs.find(input => input.checked && !input.disabled) ?? inputs.find(input => !input.disabled))?.focus(options)
    }
}
export { RadioGroupBase };
export type { RadioGroupProps } from './RadioGroupBase.js';

register('cb-radio-group', RadioGroup)
