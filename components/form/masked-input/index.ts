import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { bool, scalarText } from '../../core/value.js'
import { MaskedInputBase, formatMaskedValue, unmaskValue } from './MaskedInputBase.js'
const css = editorCSS + `
:host{display:block;inline-size:var(--component-masked-input-width,360px);max-inline-size:100%;min-inline-size:min(100%,var(--component-masked-input-min-width,240px))}
[part~=input]{inline-size:100%;min-inline-size:0;box-sizing:border-box;min-block-size:var(--cb-height);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-background);color:var(--color-foreground);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);font:inherit}
[part~=input]:focus{outline:var(--focus-ring);outline-offset:1px}[part~=input][aria-invalid=true]{border-color:var(--color-danger)}
`;
export class MaskedInput extends MaskedInputBase {
    render(): Template {
        return html`<style part="styles">${css}</style>
            <input ref="input" part="control input" type="text" value="${this.formattedValue}" placeholder="${this.maskGuide}"
                disabled="${() => this.unavailable}" readonly="${() => bool(this.readOnly)}" required="${() => bool(this.required)}"
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
