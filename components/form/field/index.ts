import { type Template, element, html } from '../../core/runtime.js'
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
    private group?: HTMLElement;
    private header?: HTMLElement;
    private labelNode?: HTMLElement;
    private requirementNode?: HTMLElement;
    private descriptionNode?: HTMLElement;
    private helpNode?: HTMLElement;
    private detailsNode?: HTMLDetailsElement;
    private detailsSummary?: HTMLElement;
    private detailsCopy?: HTMLElement;
    private errorNode?: HTMLElement;
    private successNode?: HTMLElement;
    private controlSlot?: HTMLSlotElement;
    render(): Template {
        this.group = element('div', { attributes: { part: 'field' } }) as HTMLDivElement;
        this.group.setAttribute('role', 'group');
        this.header = element('div', { attributes: { part: 'header' } }) as HTMLDivElement;
        const labelWrap = element('div', { attributes: { part: 'label-wrap' } }) as HTMLDivElement;
        this.labelNode = element('span', { attributes: { part: 'label' } }) as HTMLSpanElement;
        this.requirementNode = element('span', { attributes: { part: 'requirement' } }) as HTMLSpanElement;
        labelWrap.append(this.labelNode, this.requirementNode);
        labelWrap.addEventListener('click', () => this.focusControl());
        this.header.append(labelWrap, element("slot", { attributes: { name: 'actions', part: 'actions' }, textContent: '' }) as HTMLSlotElement);
        const control = element('div', { attributes: { part: 'control-container' } }) as HTMLDivElement;
        this.controlSlot = element("slot", { attributes: { name: '', part: 'control-slot' }, textContent: '' }) as HTMLSlotElement;
        this.controlSlot.addEventListener('slotchange', () => this.syncControl());
        control.append(this.controlSlot);
        this.descriptionNode = element('p', { attributes: { part: 'description' } }) as HTMLParagraphElement;
        this.helpNode = element('p', { attributes: { part: 'help' } }) as HTMLParagraphElement;
        this.detailsNode = element('details', { attributes: { part: 'details' } }) as HTMLDetailsElement;
        this.detailsSummary = element('summary', { attributes: { part: 'details-summary' } }) as HTMLElement;
        this.detailsCopy = element('p', { attributes: { part: 'details-copy' } }) as HTMLParagraphElement;
        this.detailsNode.append(this.detailsSummary, this.detailsCopy, element("slot", { attributes: { name: 'details', part: 'details-content' }, textContent: '' }) as HTMLSlotElement);
        this.errorNode = element('p', { attributes: { part: 'error' } }) as HTMLParagraphElement;
        this.errorNode.setAttribute('role', 'alert');
        this.successNode = element('p', { attributes: { part: 'success' } }) as HTMLParagraphElement;
        this.successNode.setAttribute('role', 'status');
        this.group.append(this.header, control, this.descriptionNode, this.helpNode, this.detailsNode, this.errorNode, this.successNode);
        return html`<style part="styles">${css}</style>${this.group}`;
    }
    protected syncView(): void {
        if (!this.group || !this.header || !this.labelNode || !this.requirementNode || !this.descriptionNode || !this.helpNode || !this.detailsNode || !this.detailsSummary || !this.detailsCopy || !this.errorNode || !this.successNode)
            return;
        const label = this.fieldLabel();
        const required = bool(this.required);
        const requirement = required ? '' : scalarText(this.optionalLabel);
        const description = scalarText(this.description);
        const help = this.fieldHelp();
        const details = this.fieldDetails();
        const detailsLabel = scalarText(this.detailsLabel);
        const error = this.fieldError();
        const success = this.fieldSuccess();
        this.labelNode.textContent = label;
        this.labelNode.hidden = !label;
        this.requirementNode.textContent = requirement;
        this.requirementNode.hidden = !requirement;
        this.descriptionNode.textContent = description;
        this.descriptionNode.hidden = !description;
        this.helpNode.textContent = help;
        this.helpNode.hidden = !help;
        this.detailsSummary.textContent = detailsLabel;
        this.detailsCopy.textContent = details;
        this.detailsCopy.hidden = !details;
        this.detailsNode.hidden = !detailsLabel && !details && !this.querySelector('[slot=details]');
        this.errorNode.textContent = error;
        this.errorNode.hidden = !error;
        this.successNode.textContent = success;
        this.successNode.hidden = !success || this.isInvalid();
        this.toggleAttribute('data-invalid', this.isInvalid());
        this.toggleAttribute('data-success', this.isSuccess());
        this.header.hidden = !label && !requirement && !this.querySelector('[slot=actions]');
        const labelId = this.labelNode.id || uid('cb-field-label');
        this.labelNode.id = labelId;
        const descriptionId = this.descriptionNode.id || uid('cb-field-description');
        this.descriptionNode.id = descriptionId;
        const helpId = this.helpNode.id || uid('cb-field-help');
        this.helpNode.id = helpId;
        const errorId = this.errorNode.id || uid('cb-field-error');
        this.errorNode.id = errorId;
        const successId = this.successNode.id || uid('cb-field-success');
        this.successNode.id = successId;
        aria(this.group, 'aria-labelledby', label ? labelId : null);
        aria(this.group, 'aria-describedby', [description ? descriptionId : '', help ? helpId : '', error ? errorId : '', this.isSuccess() && success ? successId : ''].filter(Boolean).join(' ') || null);
        aria(this.group, 'aria-invalid', this.isInvalid() ? true : null);
        aria(this.group, 'aria-disabled', this.unavailable ? true : null);
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
