import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { uid } from '../../core/id.js'
import { createIcon } from '../../icons/paths.js';
import { bool, text } from '../../core/value.js';
import { PopupController } from '../../core/popup.js';
import { SelectBase } from './SelectBase.js';
import { createBareButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
const css = editorCSS + `
:host{display:inline-block;inline-size:var(--component-select-width,240px)}[part~=root]{position:relative;display:grid}
[part~=trigger]{display:block;inline-size:100%;padding:0;text-align:start}[part~=trigger]::part(control),[part~=trigger]::part(button-label){display:flex;align-items:center;justify-content:space-between;gap:8px;inline-size:100%;text-align:inherit}[part~=trigger]::part(control){padding:var(--spacing-xs,4px) var(--spacing-md,12px)}[part~=value][data-placeholder]{color:var(--color-muted-foreground)}
[part~=value]{min-inline-size:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[part~=trigger][data-multi]{align-items:flex-start;block-size:auto}
[part~=trigger][data-multi] [part~=value]{display:flex;flex:1;flex-wrap:wrap;gap:2px 4px;overflow:visible;text-overflow:clip;white-space:normal}
[part~=value-item]{white-space:nowrap}
[part~=trigger][data-multi] [part~=indicator]{margin-block-start:2px}
    [part~=popup]{z-index:var(--z-index-dropdown,1000);display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:4px;inline-size:max-content;box-sizing:border-box;overflow:hidden;padding:4px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);color:var(--color-foreground);box-shadow:var(--shadow-md,0 12px 32px rgba(0,0,0,.14))}
[part~=search-wrap]{display:flex;padding:2px}
[part~=search]{inline-size:100%;min-block-size:var(--cb-height);padding-inline:10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-foreground);font:inherit}
[part~=search]:focus-visible{outline:var(--focus-ring);outline-offset:var(--focus-ring-offset)}
    [part~=listbox]{display:grid;gap:2px;min-block-size:0;max-block-size:220px;overflow:auto}
[part~=option]{display:block;inline-size:100%;min-block-size:var(--cb-height);border-color:transparent;background:transparent;text-align:start}[part~=option]::part(control),[part~=option]::part(button-label){display:flex;align-items:center;justify-content:space-between;inline-size:100%;text-align:inherit}[part~=option]::part(control){padding:var(--spacing-xs,4px) var(--spacing-md,12px)}[part~=option][aria-selected=true]{background:var(--color-selection);color:var(--color-signal-text)}
[part~=empty]{padding:10px;color:var(--color-muted-foreground);text-align:center}
[part~=native]{inline-size:100%;appearance:auto;color-scheme:inherit}
`;
export class Select extends SelectBase {
    private nativeControl?: HTMLSelectElement;
    private trigger?: Button;
    private valueNode?: HTMLElement;
    private popup?: HTMLElement;
    private searchWrap?: HTMLElement;
    private searchInput?: HTMLInputElement;
    private listbox?: HTMLElement;
    private emptyNode?: HTMLElement;
    private popupController?: PopupController;
    private query = '';
    render(): Template {
        const root = element('div', { attributes: { part: 'root' } }) as HTMLDivElement;
        this.trigger = createBareButton('trigger control', event => {
            const opening = !bool(this.open);
            if (this.setOpen(opening, event) && opening && this.searchEnabled)
                this.searchInput?.focus();
        });
        this.trigger.id = uid('cb-select');
        this.valueNode = element('span', { attributes: { part: 'value' } }) as HTMLSpanElement;
        this.trigger.append(this.valueNode, createIcon('down', 'icon indicator'));
        this.popup = element('div', { attributes: { part: 'popup' } }) as HTMLDivElement;
        this.searchWrap = element('div', { attributes: { part: 'search-wrap' } }) as HTMLDivElement;
        this.searchInput = element('input', { attributes: { part: 'search' } }) as HTMLInputElement;
        this.searchInput.type = 'search';
        this.searchInput.id = `${this.trigger.id}-search`;
        this.listbox = element('div', { attributes: { part: 'listbox' } }) as HTMLDivElement;
        this.listbox.id = `${this.trigger.id}-listbox`;
        this.listbox.setAttribute('role', 'listbox');
        this.emptyNode = element('div', { attributes: { part: 'empty' } }) as HTMLDivElement;
        this.emptyNode.setAttribute('role', 'status');
        this.searchWrap.append(this.searchInput);
        this.popup.append(this.searchWrap, this.listbox, this.emptyNode);
        this.nativeControl = element('select', { attributes: { part: 'native control' } }) as HTMLSelectElement;
        this.nativeControl.id = `${this.trigger.id}-native`;
        this.trigger.addEventListener('keydown', event => this.handleKey(event));
        this.popup.addEventListener('keydown', event => this.handleKey(event));
        this.searchInput.addEventListener('input', () => { this.query = this.searchInput?.value ?? ''; this.syncView(); });
        this.nativeControl.addEventListener('change', event => this.choose(bool(this.multi) ? [...this.nativeControl!.selectedOptions].map(option => option.value) : this.nativeControl!.value, event));
        this.nativeControl.addEventListener('blur', () => { this.validationShown = true; this.syncView(); });
        root.append(this.trigger, this.popup, this.nativeControl);
        return html`<style part="styles">${css}</style>${root}`;
    }
    protected mount(): void {
        if (this.popup && this.trigger) {
            this.popupController = new PopupController(this.popup, this.trigger, () => this.setOpen(false), {
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
    protected fieldElement(): HTMLSelectElement | undefined { return this.nativeControl; }
    protected syncView(): void {
        if (!this.nativeControl || !this.trigger || !this.valueNode || !this.popup || !this.searchWrap || !this.searchInput || !this.listbox || !this.emptyNode)
            return;
        const options = this.normalizedOptions, selection = this.selection, placeholder = text(this.placeholder);
        const searching = this.searchEnabled && !bool(this.native);
        if (!bool(this.open))
            this.query = '';
        const normalizedQuery = this.query.trim().toLowerCase();
        const visibleOptions = normalizedQuery ? options.filter(option => `${option.label} ${option.value}`.toLowerCase().includes(normalizedQuery)) : options;
        this.nativeControl.replaceChildren();
        this.listbox.replaceChildren();
        if (!bool(this.multi) && !options.some(option => option.value === '')) {
            const empty = element('option', { attributes: { part: 'option' }, textContent: placeholder }) as HTMLOptionElement;
            empty.value = '';
            this.nativeControl.append(empty);
        }
        for (const option of options) {
            const nativeOption = element('option', { attributes: { part: 'option' }, textContent: option.label }) as HTMLOptionElement;
            nativeOption.value = option.value;
            nativeOption.disabled = option.disabled;
            nativeOption.selected = selection.includes(option.value);
            this.nativeControl.append(nativeOption);
        }
        for (const option of visibleOptions) {
            const button = createBareButton('option', event => {
                this.choose(option.value, event);
                if (!bool(this.multi))
                    this.setOpen(false, event);
                else
                    this.optionNodes().find(node => node.dataset.value === option.value)?.focus();
            });
            button.dataset.value = option.value;
            button.disabled = option.disabled || this.unavailable;
            button.setAttribute('role', 'option');
            aria(button, 'aria-selected', selection.includes(option.value));
            button.accessibleLabel = option.label;
            button.append(element('span', { attributes: { part: 'option-label' }, textContent: option.label }) as HTMLSpanElement);
            if (selection.includes(option.value))
                button.append(createIcon('check', 'icon check'));
            this.listbox.append(button);
        }
        const labels = options.filter(option => selection.includes(option.value)).map(option => option.label);
        this.valueNode.replaceChildren();
        if (bool(this.multi) && labels.length) {
            labels.forEach((label, index) => this.valueNode?.append(element('span', { attributes: { part: 'value-item' }, textContent: `${label}${index < labels.length - 1 ? ',' : ''}` }) as HTMLSpanElement));
        }
        else
            this.valueNode.textContent = labels[0] ?? placeholder;
        this.valueNode.toggleAttribute('data-placeholder', labels.length === 0);
        const native = bool(this.native);
        this.trigger.hidden = native;
        this.nativeControl.hidden = !native;
        this.searchWrap.hidden = !searching;
        this.searchInput.value = this.query;
        this.searchInput.placeholder = text(this.searchPlaceholder);
        this.searchInput.setAttribute('aria-label', text(this.searchLabel) || text(this.searchPlaceholder) || this.accessibleName());
        this.searchInput.setAttribute('role', 'combobox');
        this.searchInput.setAttribute('aria-autocomplete', 'list');
        this.searchInput.setAttribute('aria-controls', this.listbox.id);
        aria(this.searchInput, 'aria-expanded', bool(this.open));
        this.emptyNode.textContent = text(this.emptyLabel);
        this.emptyNode.hidden = visibleOptions.length > 0 || !text(this.emptyLabel);
        aria(this.listbox, 'aria-multiselectable', bool(this.multi) ? true : null);
        this.listbox.setAttribute('aria-label', this.accessibleName());
        this.nativeControl.multiple = bool(this.multi);
        this.nativeControl.disabled = this.unavailable || bool(this.readOnly);
        this.nativeControl.required = bool(this.required) && !bool(this.readOnly);
        this.nativeControl.setAttribute('aria-label', this.accessibleName());
        this.trigger.disabled = this.unavailable || bool(this.readOnly);
        this.trigger.toggleAttribute('data-multi', bool(this.multi));
        const accessibleName = this.accessibleName();
        const visibleValue = labels.join(', ') || placeholder;
        this.trigger.accessibleLabel = visibleValue && visibleValue !== accessibleName ? `${accessibleName}: ${visibleValue}` : accessibleName;
        this.trigger.setAttribute('aria-haspopup', 'listbox');
        this.trigger.setAttribute('aria-controls', this.listbox.id);
        aria(this.trigger, 'aria-expanded', bool(this.open));
        this.syncForm(bool(this.multi) ? this.multipleFormValue(selection) : selection[0] ?? '');
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText)));
        const description = [text(this.description), error ? this.validationMessage : ''].filter(Boolean).join(' ') || null;
        aria(this.trigger, 'aria-description', description);
        aria(this.nativeControl, 'aria-description', description);
        aria(this.trigger, 'aria-invalid', error ? true : null);
        aria(this.nativeControl, 'aria-invalid', error ? true : null);
        this.toggleAttribute('data-invalid', error);
        this.syncPopup();
    }
    private syncPopup(): void {
        if (!this.popup)
            return;
        if (bool(this.native) || !bool(this.open))
            this.popupController?.hide();
        else
            this.popupController?.show();
        if (!this.popupController)
            this.popup.hidden = bool(this.native) || !bool(this.open);
    }
    private multipleFormValue(values: readonly string[]): FormData { const data = new FormData(); if (this.name)
        for (const value of values)
            data.append(this.name, value); return data; }
    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options); }
    private optionNodes(): Button[] { return [...(this.listbox?.querySelectorAll<Button>('cb-button:not([disabled])') ?? [])]; }
    private handleKey(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.setOpen(false, event);
            this.trigger?.focus();
            return;
        }
        if (!bool(this.open) && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            this.setOpen(true, event);
            if (this.searchEnabled && (event.key === 'Enter' || event.key === ' ')) {
                this.searchInput?.focus();
                return;
            }
            const options = this.optionNodes();
            const selected = options.find(option => option.getAttribute('aria-selected') === 'true');
            const target = selected ?? (event.key === 'ArrowUp' ? options.at(-1) : options[0]);
            target?.focus();
            return;
        }
        if (event.target === this.searchInput && event.key === 'ArrowDown') {
            event.preventDefault();
            this.optionNodes()[0]?.focus();
            return;
        }
        if (event.target === this.searchInput && event.key === 'ArrowUp') {
            event.preventDefault();
            this.optionNodes().at(-1)?.focus();
            return;
        }
        if (event.target === this.searchInput && event.key === 'Enter') {
            event.preventDefault();
            this.optionNodes()[0]?.click();
            return;
        }
        const options = this.optionNodes();
        const active = this.activeNode();
        const current = active?.localName === 'cb-button' ? options.indexOf(active as Button) : -1;
        if (event.key === 'ArrowDown' && options.length) {
            event.preventDefault();
            options[(current + 1) % options.length]?.focus();
        }
        if (event.key === 'ArrowUp' && options.length) {
            event.preventDefault();
            options[(current - 1 + options.length) % options.length]?.focus();
        }
    }
}
export { SelectBase };
export type { SelectProps, SelectSearchMode } from './SelectBase.js';
export type { SelectOption } from '../model.js';
