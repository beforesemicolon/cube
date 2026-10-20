import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import { is, or, and, isNot, html, repeat, state, when, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { PopupController } from '../../core/popup.js'
import type { Button } from '../../action/button/index.js'
import { SelectBase } from './SelectBase.js'

export class Select extends SelectBase {
    stylesheet = componentStylesheet

    private readonly controlId = uid('cb-select')
    private popupController?: PopupController
    private get trigger(): HTMLElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLElement ? node : undefined }
    private get popup(): HTMLElement | undefined { const node = this.refs.popup?.[0]; return node instanceof HTMLElement ? node : undefined }
    private readonly query = state('')
    private get nativeControl(): HTMLSelectElement | undefined { const node = this.refs.native?.[0]; return node instanceof HTMLSelectElement ? node : undefined }
    private get searchInput(): HTMLInputElement | undefined { const node = this.refs.search?.[0]; return node instanceof HTMLInputElement ? node : undefined }
    private get listbox(): HTMLElement | undefined { const node = this.refs.listbox?.[0]; return node instanceof HTMLElement ? node : undefined }
    private visibleOptions = () => {
        const query = this.query[0]().trim().toLowerCase()
        return query ? this.normalizedOptions.filter(option => (option.label + ' ' + option.value).toLowerCase().includes(query)) : this.normalizedOptions
    }
    private selectedLabels = (): string[] => { return this.normalizedOptions.filter(option => this.selection.includes(option.value)).map(option => option.label) }
    private displayValue = (): string => { return this.selectedLabels().join(', ') || text(this.placeholder) }
    private validationError(): boolean { return Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText))) }
    private descriptionText = (): string | null => { return [text(this.description), this.validationError() ? this.validationMessage : ''].filter(Boolean).join(' ') || null }
    render(): Template {
        return html`<div part="root">
            <cb-button ref="trigger" part="trigger control" exportparts="control:trigger-control,button-label:trigger-label" data-bare data-semantic-host
                hidden="${this.props.native}" disabled="${or(() => this.unavailable, this.props.readOnly)}" data-multi="${() => bool(this.multi) ? '' : null}"
                accessible-label="${() => this.displayValue() && this.displayValue() !== this.accessibleName() ? this.accessibleName() + ': ' + this.displayValue() : this.accessibleName()}"
                aria-haspopup="listbox" aria-controls="${this.controlId}-listbox" aria-expanded="${when(this.props.open, 'true', 'false')}"
                aria-invalid="${() => this.validationError() ? 'true' : null}" aria-description="${this.descriptionText}"
                onkeydown="${this.handleKey}"
                onaction="${(event: Event) => { event.stopPropagation(); const opening = !bool(this.open); if (this.setOpen(opening, event) && opening && this.searchEnabled) this.searchInput?.focus() }}">
                <span part="value" data-placeholder="${() => this.selection.length ? null : ''}">
                    ${when(and(this.props.multi, () => this.selectedLabels().length > 0),
                        repeat(this.selectedLabels, (label, index) => html`<span part="value-item">${label}${() => index < this.selectedLabels().length - 1 ? ',' : ''}</span>`, { key: label => label }),
                        this.displayValue)}
                </span><cb-icon part="icon indicator" name="down" decorative="true"></cb-icon>
            </cb-button>
            <div ref="popup" part="popup" hidden
                onkeydown="${this.handleKey}">
                <div part="search-wrap" hidden="${or(isNot(() => this.searchEnabled), this.props.native)}">
                    <input ref="search" part="search" type="search" id="${this.controlId}-search" value="${this.query[0]}"
                        placeholder="${this.props.searchPlaceholder}" aria-label="${() => text(this.searchLabel) || text(this.searchPlaceholder) || this.accessibleName()}"
                        role="combobox" aria-autocomplete="list" aria-controls="${this.controlId}-listbox" aria-expanded="${when(this.props.open, 'true', 'false')}"
                        oninput="${(event: Event) => { const input = event.currentTarget; if (input instanceof HTMLInputElement) this.query[1](input.value) }}">
                </div><div ref="listbox" part="listbox" id="${this.controlId}-listbox" role="listbox" aria-label="${this.accessibleName}"
                    aria-multiselectable="${() => bool(this.multi) ? 'true' : null}">
                ${repeat(this.visibleOptions, option => html`<cb-button ref="options" part="option" exportparts="control:option-control,button-label:option-label" data-bare data-semantic-host
                    data-value="${option.value}" role="option" accessible-label="${option.label}" disabled="${or(option.disabled, () => this.unavailable)}"
                    aria-selected="${when(is(() => this.selection.includes(option.value)), 'true', 'false')}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.choose(option.value, event); if (!bool(this.multi)) this.setOpen(false, event); else queueMicrotask(() => this.optionNodes().find(node => node.dataset.value === option.value)?.focus()) }}">
                    <span part="option-label">${option.label}</span>${when(is(() => this.selection, values => values.includes(option.value)), html`<cb-icon part="icon check" name="check" decorative="true"></cb-icon>`)}
                </cb-button>`, { key: option => option.value })}
                </div>
                <span part="empty" role="status" hidden="${or(() => this.visibleOptions().length > 0, isNot(this.props.emptyLabel))}">${this.props.emptyLabel}</span>
            </div>
            <select ref="native" part="native control" id="${this.controlId}-native" hidden="${isNot(this.props.native)}"
                multiple="${this.props.multi}" disabled="${or(() => this.unavailable, this.props.readOnly)}" required="${and(this.props.required, isNot(this.props.readOnly))}"
                aria-label="${this.accessibleName}" aria-invalid="${() => this.validationError() ? 'true' : null}" aria-description="${this.descriptionText}"
                onchange="${(event: Event) => { const select = event.currentTarget; if (select instanceof HTMLSelectElement) this.choose(bool(this.multi) ? [...select.selectedOptions].map(option => option.value) : select.value, event) }}"
                onblur="${() => { this.validationShown = true }}">
                ${when(and(isNot(this.props.multi), isNot(() => this.normalizedOptions.some(option => option.value === ''))), html`<option part="option" value="" selected="${isNot(() => this.selection.length)}">${this.props.placeholder}</option>`)}
                ${repeat(() => this.normalizedOptions, option => html`<option part="option" value="${option.value}" disabled="${option.disabled}" selected="${is(() => this.selection, values => values.includes(option.value))}">${option.label}</option>`, { key: option => option.value })}
            </select>
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
    protected fieldElement(): HTMLSelectElement | undefined { return this.nativeControl }
    protected syncView(): void { if (!bool(this.open)) this.query[1](''); this.syncPopup() }
    private syncPopup(): void {
        if (!this.popup) return
        if (bool(this.native) || !bool(this.open)) this.popupController?.hide()
        else this.popupController?.show()
        if (!this.popupController) this.popup.hidden = bool(this.native) || !bool(this.open)
    }
    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options) }
    private optionNodes(): HTMLElement[] { return elementRefs(this.refs.options).filter(node => !node.hasAttribute('disabled')) }
    private handleKey = (event: KeyboardEvent): void => {
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
