import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import { when, is, or, isNot, html, repeat, state, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { PopupController } from '../../core/popup.js'
import type { Button } from '../../action/button/index.js'
import { ComboboxBase } from './ComboboxBase.js'

export class Combobox extends ComboboxBase {
    stylesheet = componentStylesheet

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
        return html`<div part="root">
            <div ref="trigger" part="input-shell control"><cb-icon part="icon prefix" name="search" decorative="true"></cb-icon>
                <input ref="input" part="input" type="text" id="${this.controlId}" value="${this.displayValue}" placeholder="${this.props.placeholder}"
                    disabled="${() => this.unavailable}" readonly="${this.props.readOnly}" required="${this.props.required}"
                    aria-label="${this.accessibleName}" role="combobox" aria-autocomplete="${() => this.autocomplete ?? 'list'}"
                    aria-controls="${this.controlId}-listbox" aria-expanded="${when(this.props.open, 'true', 'false')}"
                    aria-invalid="${() => this.validationError() ? 'true' : null}" aria-description="${this.descriptionText}"
                    oninput="${this.handleInput}"
                    onkeydown="${this.handleKey}">
                <cb-button part="toggle" exportparts="control:toggle-control,label:toggle-label,button-label:toggle-label,icon:toggle-icon,description:toggle-description" variant="ghost" icon="down" icon-only="true" accessible-label="${() => text(this.toggleLabel) || this.accessibleName()}"
                    disabled="${or(() => this.unavailable, this.props.readOnly)}" aria-haspopup="listbox" aria-controls="${this.controlId}-listbox" aria-expanded="${when(this.props.open, 'true', 'false')}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.setOpen(!this.open, event); this.input?.focus() }}"></cb-button>
            </div>
            <div ref="popup" part="popup listbox" hidden role="listbox" id="${this.controlId}-listbox" aria-label="${this.accessibleName}"
                onkeydown="${this.handleKey}">

                ${repeat(this.filteredOptions, option => html`<cb-button ref="options" part="option" exportparts="control:option-control,button-label:option-label" data-bare data-semantic-host
                    data-value="${option.value}" role="option" accessible-label="${option.label}" disabled="${or(option.disabled, () => this.unavailable)}"
                    aria-selected="${when(is(() => option.value === this.value), 'true', 'false')}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.setValue(option.value, event); this.setOpen(false, event); this.input?.focus() }}">
                    ${option.label}
                </cb-button>`, { key: option => option.value })}

                <span part="empty" role="status" hidden="${or(() => this.filteredOptions().length > 0, isNot(this.props.emptyLabel))}">${this.props.emptyLabel}</span>
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
            const options = elementRefs(this.refs.options).filter(node => !node.hasAttribute('disabled'));
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
