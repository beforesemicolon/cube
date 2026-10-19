import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js';
import { RadioGroupBase } from './RadioGroupBase.js';
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
    private group?: HTMLElement;
    private titleNode?: HTMLElement;
    private descriptionNode?: HTMLElement;
    private errorNode?: HTMLElement;
    private inputs: HTMLInputElement[] = [];
    private readonly internalName = uid('cb-radio-group');
    render(): Template {
        const field = element('div', { attributes: { part: 'field' } }) as HTMLDivElement;
        this.titleNode = element('span', { attributes: { part: 'label' } }) as HTMLSpanElement;
        this.titleNode.id = `${this.internalName}-label`;
        this.group = element('div', { attributes: { part: 'group options' } }) as HTMLDivElement;
        this.group.setAttribute('role', 'radiogroup');
        this.descriptionNode = element('p', { attributes: { part: 'description' } }) as HTMLParagraphElement;
        this.descriptionNode.id = `${this.internalName}-description`;
        this.errorNode = element('p', { attributes: { part: 'error' } }) as HTMLParagraphElement;
        this.errorNode.id = `${this.internalName}-error`;
        this.errorNode.setAttribute('role', 'alert');
        field.append(this.titleNode, this.group, this.descriptionNode, this.errorNode);
        return html`<style part="styles">${css}</style>${field}`;
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.inputs[0]; }
    protected syncView(): void {
        if (!this.group || !this.titleNode || !this.descriptionNode || !this.errorNode)
            return;
        const selected = this.selection;
        this.inputs = [];
        this.group.replaceChildren();
        this.group.toggleAttribute('data-stacked', bool(this.stacked));
        for (const option of this.normalizedOptions) {
            const wrapper = element('label', { attributes: { part: 'option' } }) as HTMLLabelElement;
            const input = element('input', { attributes: { part: 'control radio' } }) as HTMLInputElement;
            const label = element('span', { attributes: { part: 'option-label' }, textContent: option.label }) as HTMLSpanElement;
            input.type = 'radio';
            input.name = this.internalName;
            input.value = option.value;
            input.checked = option.value === selected;
            input.disabled = option.disabled || this.unavailable || bool(this.readOnly);
            input.required = bool(this.required);
            wrapper.toggleAttribute('data-disabled', input.disabled);
            input.addEventListener('change', event => {
                if (!input.checked)
                    return;
                this.choose(input.value, event);
                this.inputs.find(candidate => candidate.value === input.value)?.focus();
            });
            wrapper.append(input, label);
            this.inputs.push(input);
            this.group.append(wrapper);
        }
        const visibleLabel = text(this.label);
        const accessibleLabel = this.accessibleName();
        this.titleNode.textContent = visibleLabel;
        this.titleNode.hidden = !visibleLabel;
        aria(this.group, 'aria-labelledby', visibleLabel ? this.titleNode.id : null);
        aria(this.group, 'aria-label', visibleLabel ? null : accessibleLabel);
        aria(this.group, 'aria-required', bool(this.required) ? true : null);
        aria(this.group, 'aria-readonly', bool(this.readOnly) ? true : null);
        this.descriptionNode.textContent = text(this.description);
        this.descriptionNode.hidden = !text(this.description);
        this.syncForm(selected);
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText)));
        this.errorNode.textContent = error ? this.validationMessage : '';
        this.errorNode.hidden = !error;
        const describedBy = [text(this.description) ? this.descriptionNode.id : '', error ? this.errorNode.id : ''].filter(Boolean).join(' ') || null;
        aria(this.group, 'aria-describedby', describedBy);
        aria(this.group, 'aria-invalid', error ? true : null);
    }
    focus(options?: FocusOptions): void {
        const target = this.inputs.find(input => input.checked && !input.disabled) ?? this.inputs.find(input => !input.disabled);
        target?.focus(options);
    }
}
export { RadioGroupBase };
export type { RadioGroupProps } from './RadioGroupBase.js';
