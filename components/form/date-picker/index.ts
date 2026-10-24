import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { when, or, isNot, html, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { PopupController } from '../../core/popup.js'

import { DatePickerBase } from './DatePickerBase.js'

export class DatePicker extends DatePickerBase {
    stylesheet = componentStylesheet

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
export type { DatePickerProps, DatePickerChangeDetail } from './DatePickerBase.js';

register('cb-date-picker', DatePicker)
