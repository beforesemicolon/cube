import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { uid } from '../../core/id.js'
import { createIcon } from '../../icons/paths.js';
import { actionLabel, createBareButton, createIconButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
import { text } from '../../core/value.js';
import { PopupController } from '../../core/popup.js';
import { ComboboxBase } from './ComboboxBase.js';
const css = editorCSS + `
:host{display:inline-block;inline-size:var(--component-combobox-width,280px)}[part~=root]{position:relative;display:grid}[part~=input-shell]{display:flex;align-items:center;block-size:var(--cb-height);min-block-size:var(--cb-height);padding:0;overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-muted)}
[part~=prefix]{margin-inline-start:var(--spacing-md,12px)}[part~=input]{flex:1;inline-size:100%;min-inline-size:0;block-size:100%;padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:0;background:transparent;outline:0}[part~=toggle]{display:block;align-self:stretch;block-size:100%}[part~=toggle]::part(control){block-size:100%;min-block-size:0;border-radius:0 var(--radius-sm) var(--radius-sm) 0}
    [part~=popup]{z-index:var(--z-index-dropdown,1000);inline-size:max-content;box-sizing:border-box;overflow:auto;padding:4px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);color:var(--color-foreground);box-shadow:var(--shadow-md,0 12px 32px rgba(0,0,0,.14))}
[part~=option]{display:block;inline-size:100%;min-block-size:var(--cb-height);border-color:transparent;background:transparent;text-align:start}[part~=option]::part(control){justify-content:flex-start;padding:var(--spacing-xs,4px) var(--spacing-md,12px);text-align:inherit}[part~=option][aria-selected=true]{background:var(--color-selection)}[part~=empty]{display:block;padding:10px;color:var(--color-muted-foreground)}
`;
export class Combobox extends ComboboxBase {
    private input?: HTMLInputElement;
    private inputShell?: HTMLElement;
    private popup?: HTMLElement;
    private popupController?: PopupController;
    private toggleButton?: Button;
    render(): Template {
        const root = element('div', { attributes: { part: 'root' } }) as HTMLDivElement;
        this.inputShell = element('div', { attributes: { part: 'input-shell control' } }) as HTMLDivElement;
        this.input = element('input', { attributes: { part: 'input' } }) as HTMLInputElement;
        this.input.type = 'text';
        this.input.id = uid('cb-combobox');
        this.toggleButton = createIconButton('toggle', 'down', event => { this.setOpen(!this.open, event); this.input?.focus(); });
        this.popup = element('div', { attributes: { part: 'popup listbox' } }) as HTMLDivElement;
        this.popup.id = `${this.input.id}-popup`;
        this.popup.setAttribute('role', 'listbox');
        this.input.addEventListener('input', event => this.handleInput(event));
        this.input.addEventListener('focus', event => this.setOpen(true, event));
        this.input.addEventListener('keydown', event => this.handleKey(event));
        this.popup.addEventListener('keydown', event => this.handleKey(event));
        this.inputShell.append(createIcon('search', 'icon prefix'), this.input, this.toggleButton);
        root.append(this.inputShell, this.popup);
        return html`<style part="styles">${css}</style>${root}`;
    }
    protected mount(): void {
        if (this.popup && this.inputShell) {
            this.popupController = new PopupController(this.popup, this.inputShell, () => this.setOpen(false), {
                placement: () => 'bottom-start',
                matchAnchorWidth: true,
                maxWidth: () => this.popupMaxWidth,
                maxHeight: () => this.popupMaxHeight,
            });
            this.cleanup(() => this.popupController?.dispose());
        }
        super.mount();
        this.syncPopup();
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.input; }
    protected syncView(): void {
        if (!this.input || !this.popup || !this.toggleButton)
            return;
        const selected = this.normalizedOptions.find(option => option.value === this.value);
        const displayValue = selected?.label ?? this.value;
        if (this.input.value !== displayValue)
            this.input.value = displayValue;
        this.input.placeholder = text(this.placeholder);
        this.input.disabled = this.unavailable;
        this.input.readOnly = this.readOnly;
        this.input.required = this.required;
        this.input.setAttribute('aria-label', this.accessibleName());
        this.input.setAttribute('role', 'combobox');
        this.input.setAttribute('aria-autocomplete', this.autocomplete ?? 'list');
        this.input.setAttribute('aria-controls', this.popup.id);
        aria(this.input, 'aria-expanded', this.open);
        actionLabel(this.toggleButton, text(this.toggleLabel) || this.accessibleName());
        this.toggleButton.disabled = this.unavailable || this.readOnly;
        this.toggleButton.setAttribute('aria-haspopup', 'listbox');
        this.toggleButton.setAttribute('aria-expanded', String(this.open));
        this.toggleButton.setAttribute('aria-controls', this.popup.id);
        this.popup.replaceChildren();
        const options = this.filteredOptions();
        for (const option of options) {
            const button = createBareButton('option', event => { this.setValue(option.value, event); this.setOpen(false, event); this.input?.focus(); });
            actionLabel(button, option.label);
            button.disabled = option.disabled;
            button.dataset.value = option.value;
            button.setAttribute('role', 'option');
            aria(button, 'aria-selected', option.value === this.value);
            this.popup.append(button);
        }
        if (!options.length && text(this.emptyLabel))
            this.popup.append(element('span', { attributes: { part: 'empty' }, textContent: text(this.emptyLabel) }) as HTMLSpanElement);
        this.popup.setAttribute('aria-label', this.accessibleName());
        this.syncPopup();
        this.syncForm(this.value);
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText)));
        aria(this.input, 'aria-invalid', error ? true : null);
        aria(this.input, 'aria-description', [text(this.description), error ? this.validationMessage : ''].filter(Boolean).join(' ') || null);
        this.toggleAttribute('data-invalid', error);
    }
    private syncPopup(): void {
        if (!this.popup)
            return;
        if (this.open)
            this.popupController?.show();
        else
            this.popupController?.hide();
        if (!this.popupController)
            this.popup.hidden = !this.open;
    }
    private handleInput(event: Event): void {
        if (!this.input)
            return;
        const query = this.input.value;
        this.setValue(query, event);
        this.setOpen(true, event);
        if (this.autocomplete !== 'both' || !query)
            return;
        const match = this.normalizedOptions.find(option => !option.disabled && option.label.toLocaleLowerCase().startsWith(query.toLocaleLowerCase()));
        if (!match)
            return;
        this.input.value = match.label;
        this.input.setSelectionRange(query.length, match.label.length);
    }
    private handleKey(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.setOpen(false, event);
            this.input?.focus();
            return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!this.open)
                this.setOpen(true, event);
            const options = [...(this.popup?.querySelectorAll<Button>('cb-button:not([disabled])') ?? [])];
            const active = this.activeNode();
            const current = active?.localName === 'cb-button' ? options.indexOf(active as Button) : -1;
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            options[current < 0 ? (direction > 0 ? 0 : options.length - 1) : (current + direction + options.length) % options.length]?.focus();
        }
        const active = this.activeNode();
        if (event.key === 'Enter' && active?.localName === 'cb-button') {
            event.preventDefault();
            (active as Button).click();
        }
    }
}
export { ComboboxBase };
export type { ComboboxProps } from './ComboboxBase.js';
