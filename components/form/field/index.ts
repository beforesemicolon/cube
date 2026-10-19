import { type Template, html, state } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { uid } from '../../core/id.js'
import { bool, scalarText } from '../../core/value.js';
import { FieldBase } from './FieldBase.js';
const css = editorCSS + `
:host{display:inline-grid;inline-size:var(--component-field-width,fit-content);max-inline-size:100%;min-inline-size:0}
[part~=field]{display:grid;gap:var(--spacing-xs,4px);inline-size:100%;min-inline-size:0;box-sizing:border-box}
[part~=header]{display:flex;align-items:baseline;justify-content:space-between;gap:var(--spacing-sm,8px);min-inline-size:0}
[part~=label-wrap]{display:flex;align-items:baseline;gap:var(--spacing-xs,4px);min-inline-size:0}
[part~=label]{font-weight:600}[part~=requirement]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px)}
[part~=control-container]{display:block;min-inline-size:0}
[part~=description],[part~=help],[part~=error],[part~=success]{margin:0}
[part~=details]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px)}
[part~=details-summary]{cursor:pointer;color:var(--color-signal-text)}[part~=details-copy]{margin-block:var(--spacing-xs,4px) 0}
[part~=success]{color:var(--color-success)}
:host([data-invalid]) ::slotted(*){--color-border:var(--color-danger)}
:host([data-success]) ::slotted(*){--color-border:var(--color-success)}
`;
interface FieldControlElement extends HTMLElement {
    accessibleLabel?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    error?: string;
    errorText?: string;
}
export class Field extends FieldBase {
    private readonly fieldId = uid('cb-field');
    private readonly labelId = uid('cb-field-label');
    private readonly assigned = state({actions:false, details:false});
    private get controlSlot(): HTMLSlotElement | undefined {
        const slot=this.refs.control?.[0]; return slot instanceof HTMLSlotElement ? slot : undefined;
    }
    private syncSlots(): void {
        const has = (name: string): boolean => (this.refs[name] ?? []).some(slot => slot instanceof HTMLSlotElement && slot.assignedNodes({flatten:true}).length > 0);
        this.assigned[1]({actions:has('actions'),details:has('details')});
    }
    render(): Template {
        return html`<style part="styles">${css}</style><div part="field" role="group"
            aria-labelledby=${() => this.fieldLabel() ? this.labelId : null}
            aria-describedby=${() => [
                this.description ? `${this.fieldId}-description` : '',
                this.fieldHelp() ? `${this.fieldId}-help` : '',
                this.fieldError() ? `${this.fieldId}-error` : '',
                this.isSuccess() && this.fieldSuccess() ? `${this.fieldId}-success` : ''
            ].filter(Boolean).join(' ') || null}
            aria-invalid=${() => this.isInvalid() || null} aria-disabled=${() => this.unavailable || null}>
            <div part="header" hidden=${() => !this.fieldLabel() && (bool(this.required) || !this.optionalLabel) && !this.assigned[0]().actions}>
                <div part="label-wrap" onclick=${() => this.focusControl()}>
                    <span part="label" id=${this.labelId} hidden=${() => !this.fieldLabel()}>${() => this.fieldLabel()}</span>
                    <span part="requirement" hidden=${() => bool(this.required) || !this.optionalLabel}>${() => this.optionalLabel}</span>
                </div><slot part="actions" name="actions" ref="actions" onslotchange=${() => this.syncSlots()}></slot>
            </div><div part="control-container"><slot part="control-slot" ref="control" onslotchange=${() => this.syncControl()}></slot></div>
            <p part="description" id=${`${this.fieldId}-description`} hidden=${() => !this.description}>${() => this.description}</p>
            <p part="help" id=${`${this.fieldId}-help`} hidden=${() => !this.fieldHelp()}>${() => this.fieldHelp()}</p>
            <details part="details" hidden=${() => !this.detailsLabel && !this.fieldDetails() && !this.assigned[0]().details}>
                <summary part="details-summary">${() => this.detailsLabel}</summary><p part="details-copy" hidden=${() => !this.fieldDetails()}>${() => this.fieldDetails()}</p>
                <slot part="details-content" name="details" ref="details" onslotchange=${() => this.syncSlots()}></slot>
            </details>
            <p part="error" role="alert" id=${`${this.fieldId}-error`} hidden=${() => !this.fieldError()}>${() => this.fieldError()}</p>
            <p part="success" role="status" id=${`${this.fieldId}-success`} hidden=${() => !this.fieldSuccess() || this.isInvalid()}>${() => this.fieldSuccess()}</p>
        </div>`;
    }
    protected syncView(): void {
        this.toggleAttribute('data-invalid',this.isInvalid());
        this.toggleAttribute('data-success',this.isSuccess());
        this.syncControl();
    }
    private syncControl(): void {
        const control = this.controlSlot?.assignedElements({ flatten: true })[0];
        if (!(control instanceof HTMLElement))
            return;
        const fieldControl = control as FieldControlElement;
        const label = this.accessibleName();
        const description = [scalarText(this.description), this.fieldHelp(), this.isSuccess() ? this.fieldSuccess() : ''].filter(Boolean).join(' ');
        const error = this.fieldError();
        const invalid = this.isInvalid();
        const disabled = this.unavailable;
        const required = bool(this.required);
        if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) {
            control.disabled = disabled;
            control.required = required;
            aria(control, 'aria-label', label || null);
            aria(control, 'aria-description', [description, error].filter(Boolean).join(' ') || null);
            aria(control, 'aria-invalid', invalid ? true : null);
        }
        else {
            fieldControl.accessibleLabel = label;
            fieldControl.description = description;
            fieldControl.disabled = disabled;
            fieldControl.required = required;
            if ('invalid' in fieldControl)
                fieldControl.invalid = invalid;
            if ('error' in fieldControl)
                fieldControl.error = error;
            if ('errorText' in fieldControl)
                fieldControl.errorText = error;
            aria(fieldControl, 'aria-label', label || null);
            aria(fieldControl, 'aria-description', description || null);
            aria(fieldControl, 'aria-invalid', invalid ? true : null);
        }
        control.toggleAttribute('data-field-invalid', invalid);
        control.toggleAttribute('data-field-success', this.isSuccess());
        control.toggleAttribute('data-field-disabled', disabled);
    }
    private focusControl(): void {
        const control = this.controlSlot?.assignedElements({ flatten: true })[0];
        if (control instanceof HTMLElement && !this.unavailable)
            control.focus();
    }
}
export { FieldBase };
export type { FieldProps } from './FieldBase.js';
