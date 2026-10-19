import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { bool, scalarText } from '../../core/value.js';
import { MaskedInputBase, formatMaskedValue, unmaskValue } from './MaskedInputBase.js';
const css = editorCSS + `
:host{display:block;inline-size:var(--component-masked-input-width,360px);max-inline-size:100%;min-inline-size:min(100%,var(--component-masked-input-min-width,240px))}
[part~=input]{inline-size:100%;min-inline-size:0;box-sizing:border-box;min-block-size:var(--cb-height);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-background);color:var(--color-foreground);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);font:inherit}
[part~=input]:focus{outline:var(--focus-ring);outline-offset:1px}[part~=input][aria-invalid=true]{border-color:var(--color-danger)}
`;
export class MaskedInput extends MaskedInputBase {
    private input?: HTMLInputElement;
    render(): Template {
        this.input = element('input', { attributes: { part: 'control input' } }) as HTMLInputElement;
        this.input.type = 'text';
        this.input.addEventListener('input', event => {
            if (!this.input)
                return;
            const accepted = this.setValue(this.input.value, event);
            if (accepted)
                queueMicrotask(() => { if (this.input)
                    this.input.setSelectionRange(this.input.value.length, this.input.value.length); });
        });
        return html`<style part="styles">${css}</style>${this.input}`;
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.input; }
    protected syncView(): void {
        if (!this.input)
            return;
        const value = this.formattedValue();
        if (this.input.value !== value)
            this.input.value = value;
        this.input.placeholder = this.maskGuide();
        this.input.disabled = this.unavailable;
        this.input.readOnly = bool(this.readOnly);
        this.input.required = bool(this.required);
        this.input.inputMode = scalarText(this.inputMode, 'text') as typeof this.input.inputMode;
        this.input.setAttribute('autocomplete', scalarText(this.autocomplete, 'off'));
        aria(this.input, 'aria-label', this.accessibleName());
        aria(this.input, 'aria-description', scalarText(this.description) || null);
        this.syncForm(this.submittedValue());
        const error = this.validationShown ? this.validationMessage : scalarText(this.errorText);
        aria(this.input, 'aria-invalid', error ? true : null);
        this.toggleAttribute('data-invalid', Boolean(error));
    }
}
export { MaskedInputBase, formatMaskedValue, unmaskValue };
export type { MaskedInputProps } from './MaskedInputBase.js';
