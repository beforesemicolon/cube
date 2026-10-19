import { when, or, isNot, css as componentStyles, html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { PopupController } from '../../core/popup.js'

import { DatePickerBase } from './DatePickerBase.js'
const css = editorCSS + `:host{display:inline-block;inline-size:var(--component-date-picker-width,240px)}[part~=root]{position:relative;display:grid}[part~=trigger]{display:block;inline-size:100%;padding:0;text-align:start}[part~=trigger]::part(control),[part~=trigger]::part(button-label){display:flex;align-items:center;justify-content:space-between;inline-size:100%;text-align:inherit}[part~=trigger]::part(control){padding:var(--spacing-xs,4px) var(--spacing-md,12px)}[part~=popup]{z-index:var(--z-index-dropdown,1000);inline-size:max-content;box-sizing:border-box;overflow:auto;padding:0;border:0;background:transparent;color:var(--color-foreground)}[part~=native]{inline-size:100%;color-scheme:inherit}`;

export class DatePicker extends DatePickerBase {
    stylesheet = componentStyles`${css}`

    private readonly controlId = uid('cb-date-picker')
    private popupController?: PopupController
    private get trigger(): HTMLElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLElement ? node : undefined }
    private get popup(): HTMLElement | undefined { const node = this.refs.popup?.[0]; return node instanceof HTMLElement ? node : undefined }
    private get nativeControl(): HTMLInputElement | undefined { const node = this.refs.native?.[0]; return node instanceof HTMLInputElement ? node : undefined }
    private displayValue = (): string => {
        const selected = this.value ? new Date(this.value + 'T12:00:00') : undefined
        return selected && !Number.isNaN(selected.valueOf()) ? new Intl.DateTimeFormat(this.documentLanguage(), { dateStyle: 'medium' }).format(selected) : text(this.placeholder)
    }
    private validationError(): boolean { return Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText))) }
    private descriptionText = (): string | null => { return [text(this.description), this.validationError() ? this.validationMessage : ''].filter(Boolean).join(' ') || null }
    render(): Template {
        return html`<div part="root" onkeydown="${(event: KeyboardEvent) => { if (event.key === 'Escape') { this.setOpen(false, event); this.trigger?.focus() } }}">
            <cb-button ref="trigger" part="trigger control" exportparts="control:trigger-control,button-label:trigger-label" data-bare data-semantic-host
                id="${this.controlId}" hidden="${this.props.native}" disabled="${or(() => this.unavailable, this.props.readOnly)}"
                accessible-label="${() => [this.accessibleName(), this.displayValue()].filter(Boolean).join(': ')}"
                aria-haspopup="dialog" aria-controls="${this.controlId}-popup" aria-expanded="${when(this.props.open, 'true', 'false')}"
                aria-invalid="${() => this.validationError() ? 'true' : null}" aria-description="${this.descriptionText}"
                onaction="${(event: Event) => { event.stopPropagation(); this.setOpen(!this.open, event) }}">
                <span part="value">${this.displayValue}</span><cb-icon part="icon" name="calendar" decorative="true"></cb-icon>
            </cb-button>
            <div ref="popup" part="popup" role="dialog" id="${this.controlId}-popup" aria-label="${this.accessibleName}" hidden>
                <cb-calendar value="${this.props.value}" min="${this.props.min}" max="${this.props.max}"
                    previous-label="${this.props.previousLabel}" next-label="${this.props.nextLabel}"
                    disabled="${or(() => this.unavailable, this.props.readOnly)}" accessible-label="${this.accessibleName}"
                    onchange="${(event: CustomEvent<{ value: string }>) => { event.stopPropagation(); this.setValue(event.detail.value, event); this.trigger?.focus() }}"></cb-calendar>
            </div>
            <input ref="native" part="native control" type="date" id="${this.controlId}-native" hidden="${isNot(this.props.native)}"
                value="${this.props.value}" min="${this.props.min}" max="${this.props.max}"
                disabled="${() => this.unavailable}" readonly="${this.props.readOnly}" required="${this.props.required}"
                aria-label="${this.accessibleName}" aria-invalid="${() => this.validationError() ? 'true' : null}" aria-description="${this.descriptionText}"
                oninput="${(event: Event) => { const input = event.currentTarget; if (input instanceof HTMLInputElement && !this.setValue(input.value, event)) input.value = this.value }}"
                onblur="${() => { this.validationShown = true }}">
        </div>`
    }
    protected mount(): void {
        if (this.popup && this.trigger) {
            this.popupController = new PopupController(this.popup, this.trigger, () => this.setOpen(false), {
                placement: () => 'bottom-start',
                maxWidth: () => this.popupMaxWidth, maxHeight: () => this.popupMaxHeight,
            })
            this.cleanup(() => this.popupController?.dispose())
        }
        super.mount()
        this.syncPopup()
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.nativeControl }
    protected syncView(): void { this.syncPopup() }
    private syncPopup(): void {
        if (!this.popup) return
        if (bool(this.native) || !bool(this.open)) this.popupController?.hide()
        else {
            this.popupController?.show()

        }
        if (!this.popupController) this.popup.hidden = bool(this.native) || !bool(this.open)
    }
    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options) }

}
export { DatePickerBase };
export type { DatePickerProps } from './DatePickerBase.js';
