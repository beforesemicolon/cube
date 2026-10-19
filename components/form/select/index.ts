import { elementRefs } from '../../core/refs.js'
import { is, or, and, isNot, css as componentStyles, html, repeat, state, when, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { PopupController } from '../../core/popup.js'
import type { Button } from '../../action/button/index.js'
import { SelectBase } from './SelectBase.js'
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
    stylesheet = componentStyles`${css}`

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
