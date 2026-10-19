import { html, repeat, state, when, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { PopupController } from '../../core/popup.js'
import type { Button } from '../../action/button/index.js'
import { ComboboxBase } from './ComboboxBase.js'
const css = editorCSS + `
:host{display:inline-block;inline-size:var(--component-combobox-width,280px)}[part~=root]{position:relative;display:grid}[part~=input-shell]{display:flex;align-items:center;block-size:var(--cb-height);min-block-size:var(--cb-height);padding:0;overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-muted)}
[part~=prefix]{margin-inline-start:var(--spacing-md,12px)}[part~=input]{flex:1;inline-size:100%;min-inline-size:0;block-size:100%;padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:0;background:transparent;outline:0}[part~=toggle]{display:block;align-self:stretch;block-size:100%}[part~=toggle]::part(control){block-size:100%;min-block-size:0;border-radius:0 var(--radius-sm) var(--radius-sm) 0}
    [part~=popup]{z-index:var(--z-index-dropdown,1000);inline-size:max-content;box-sizing:border-box;overflow:auto;padding:4px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);color:var(--color-foreground);box-shadow:var(--shadow-md,0 12px 32px rgba(0,0,0,.14))}
[part~=option]{display:block;inline-size:100%;min-block-size:var(--cb-height);border-color:transparent;background:transparent;text-align:start}[part~=option]::part(control){justify-content:flex-start;padding:var(--spacing-xs,4px) var(--spacing-md,12px);text-align:inherit}[part~=option][aria-selected=true]{background:var(--color-selection)}[part~=empty]{display:block;padding:10px;color:var(--color-muted-foreground)}
`;

export class Combobox extends ComboboxBase {
    private readonly controlId = uid('cb-combobox')
    private popupController?: PopupController
    private get trigger(): HTMLElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLElement ? node : undefined }
    private get popup(): HTMLElement | undefined { const node = this.refs.popup?.[0]; return node instanceof HTMLElement ? node : undefined }
    private readonly completion = state<{ query: string; label: string } | null>(null)
    private get input(): HTMLInputElement | undefined { const node = this.refs.input?.[0]; return node instanceof HTMLInputElement ? node : undefined }
    private displayValue = (): string => {
        const completion = this.completion[0]()
        return completion && completion.query === this.value && this.autocomplete === 'both' ? completion.label : this.normalizedOptions.find(option => option.value === this.value)?.label ?? this.value
    }
    private validationError(): boolean { return Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText))) }
    private descriptionText = (): string | null => { return [text(this.description), this.validationError() ? this.validationMessage : ''].filter(Boolean).join(' ') || null }
    render(): Template {
        return html`<style part="styles">${css}</style><div part="root">
            <div ref="trigger" part="input-shell control"><cb-icon part="icon prefix" name="search" decorative="true"></cb-icon>
                <input ref="input" part="input" type="text" id="${this.controlId}" value="${this.displayValue}" placeholder="${() => text(this.placeholder)}"
                    disabled="${() => this.unavailable}" readonly="${() => bool(this.readOnly)}" required="${() => bool(this.required)}"
                    aria-label="${this.accessibleName}" role="combobox" aria-autocomplete="${() => this.autocomplete ?? 'list'}"
                    aria-controls="${this.controlId}-listbox" aria-expanded="${() => String(bool(this.open))}"
                    aria-invalid="${() => this.validationError() ? 'true' : null}" aria-description="${this.descriptionText}"
                    oninput="${this.handleInput}" onfocus="${(event: Event) => this.setOpen(true, event)}"
                    onkeydown="${this.handleKey}">
                <cb-button part="toggle" exportparts="control:toggle-control,label:toggle-label,button-label:toggle-label,icon:toggle-icon,description:toggle-description" variant="ghost" icon="down" icon-only="true" accessible-label="${() => text(this.toggleLabel) || this.accessibleName()}"
                    disabled="${() => this.unavailable || bool(this.readOnly)}" aria-haspopup="listbox" aria-controls="${this.controlId}-listbox" aria-expanded="${() => String(bool(this.open))}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.setOpen(!this.open, event); this.input?.focus() }}"></cb-button>
            </div>
            <div ref="popup" part="popup listbox" hidden role="listbox" id="${this.controlId}-listbox" aria-label="${this.accessibleName}"
                onkeydown="${this.handleKey}">

                ${repeat(this.filteredOptions, option => html`<cb-button part="option" exportparts="control:option-control,button-label:option-label" data-bare data-semantic-host
                    data-value="${option.value}" role="option" accessible-label="${option.label}" disabled="${() => option.disabled || this.unavailable}"
                    aria-selected="${() => String(option.value === this.value)}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.setValue(option.value, event); this.setOpen(false, event); this.input?.focus() }}">
                    ${option.label}
                </cb-button>`, { key: option => option.value })}

                <span part="empty" role="status" hidden="${() => this.filteredOptions().length > 0 || !text(this.emptyLabel)}">${() => text(this.emptyLabel)}</span>
            </div>

        </div>`
    }
    protected mount(): void {
        if (this.popup && this.trigger) {
            this.popupController = new PopupController(this.popup, this.trigger, () => this.setOpen(false), {
                placement: () => 'bottom-start', matchAnchorWidth: true, maxWidth: () => this.popupMaxWidth, maxHeight: () => this.popupMaxHeight,
            })
            this.cleanup(() => this.popupController?.dispose())
        }
        super.mount()
        this.syncPopup()
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.input }
    protected syncView(): void {  this.syncPopup() }
    private syncPopup(): void {
        if (!this.popup) return
        if (!bool(this.open)) this.popupController?.hide()
        else this.popupController?.show()
        if (!this.popupController) this.popup.hidden = !bool(this.open)
    }
    private handleInput = (event: Event): void => {
        const input = this.input
        if (!input) return
        const query = input.value
        if (!this.setValue(query, event)) { input.value = this.displayValue(); return }
        this.setOpen(true, event)
        const match = this.autocomplete === 'both' && query ? this.normalizedOptions.find(option => !option.disabled && option.label.toLocaleLowerCase().startsWith(query.toLocaleLowerCase())) : undefined
        this.completion[1](match ? { query, label: match.label } : null)
        if (match) queueMicrotask(() => input.setSelectionRange(query.length, match.label.length))
    }
    private handleKey = (event: KeyboardEvent): void => {
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
