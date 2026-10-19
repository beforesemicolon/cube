import { html, repeat, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { RadioGroupBase } from './RadioGroupBase.js'
const css = editorCSS + `
:host{display:inline-block;inline-size:var(--component-radio-group-width,auto)}
[part~=field]{display:grid;gap:var(--spacing-xs,4px)}
[part~=group]{display:flex;flex-flow:row wrap;align-items:flex-start;gap:var(--spacing-md,12px)}
[part~=group][data-stacked]{flex-direction:column;flex-wrap:nowrap;gap:var(--spacing-sm,8px)}
[part~=option]{display:inline-flex;align-items:center;gap:var(--spacing-sm,8px);min-block-size:var(--cb-height);cursor:pointer}
[part~=radio]{appearance:none;display:grid;place-items:center;flex:none;inline-size:var(--component-radio-size,18px);block-size:var(--component-radio-size,18px);min-inline-size:var(--component-radio-size,18px);min-block-size:var(--component-radio-size,18px);padding:0;margin:0;border:1px solid var(--color-border);border-radius:50%;background:var(--color-surface);cursor:inherit}
[part~=radio]::before{content:'';inline-size:var(--component-radio-dot-size,8px);block-size:var(--component-radio-dot-size,8px);border-radius:50%;background:var(--color-primary);scale:0;transition:scale var(--motion-duration-fast) ease-out}
[part~=option]:hover [part~=radio]:not(:disabled){border-color:var(--color-primary)}
[part~=radio]:checked{border-color:var(--color-primary)}
[part~=radio]:checked::before{scale:1}
[part~=radio]:focus-visible{outline:var(--focus-ring);outline-offset:var(--focus-ring-offset)}
[part~=option][data-disabled]{cursor:not-allowed;opacity:.56}
[part~=error]{font-size:var(--component-caption-font-size,11px);color:var(--color-danger);margin:0}
`;
export class RadioGroup extends RadioGroupBase {
    private readonly internalName = uid('cb-radio-group')
    private validationError(): string { return (this.validationShown || text(this.errorText)) ? this.validationMessage || text(this.errorText) : '' }
    render(): Template {
        return html`<style part="styles">${css}</style><div part="field">
            <span part="label" id="${this.internalName}-label" hidden="${() => !text(this.label)}">${() => text(this.label)}</span>
            <div part="group options" role="radiogroup" data-stacked="${() => bool(this.stacked) ? '' : null}"
                aria-labelledby="${() => text(this.label) ? this.internalName + '-label' : null}"
                aria-label="${() => text(this.label) ? null : this.accessibleName()}"
                aria-required="${() => bool(this.required) ? 'true' : null}" aria-readonly="${() => bool(this.readOnly) ? 'true' : null}"
                aria-invalid="${() => this.validationError() ? 'true' : null}"
                aria-describedby="${() => [text(this.description) ? this.internalName + '-description' : '', this.validationError() ? this.internalName + '-error' : ''].filter(Boolean).join(' ') || null}">
                ${repeat(() => this.normalizedOptions, option => html`<label part="option" data-disabled="${() => option.disabled || this.unavailable || bool(this.readOnly) ? '' : null}">
                    <input ref="input" part="control radio" type="radio" name="${this.internalName}" value="${option.value}"
                        checked="${() => option.value === this.selection}" disabled="${() => option.disabled || this.unavailable || bool(this.readOnly)}"
                        required="${() => bool(this.required)}"
                        onchange="${(event: Event) => { const input = event.currentTarget; if (input instanceof HTMLInputElement && input.checked) this.choose(input.value, event) }}">
                    <span part="option-label">${option.label}</span>
                </label>`, { key: option => option.value })}
            </div>
            <p part="description" id="${this.internalName}-description" hidden="${() => !text(this.description)}">${() => text(this.description)}</p>
            <p part="error" role="alert" id="${this.internalName}-error" hidden="${() => !this.validationError()}">${() => this.validationError()}</p>
        </div>`
    }
    protected fieldElement(): HTMLInputElement | undefined {
        return this.refs.input?.find((node): node is HTMLInputElement => node instanceof HTMLInputElement)
    }
    focus(options?: FocusOptions): void {
        const inputs = this.refs.input?.filter((node): node is HTMLInputElement => node instanceof HTMLInputElement) ?? []
        ;(inputs.find(input => input.checked && !input.disabled) ?? inputs.find(input => !input.disabled))?.focus(options)
    }
}
export { RadioGroupBase };
export type { RadioGroupProps } from './RadioGroupBase.js';
