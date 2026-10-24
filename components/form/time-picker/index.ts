import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import { when, is, or, isNot, html, repeat, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js'
import { bool, text } from '../../core/value.js'
import { PopupController } from '../../core/popup.js'
import type { Button } from '../../action/button/index.js'
import { TimePickerBase } from './TimePickerBase.js'

export class TimePicker extends TimePickerBase {
    stylesheet = componentStylesheet

    private readonly controlId = uid('cb-time-picker')
    private popupController?: PopupController
    private get trigger(): HTMLElement | undefined { const node = this.refs.trigger?.[0]; return node instanceof HTMLElement ? node : undefined }
    private get popup(): HTMLElement | undefined { const node = this.refs.popup?.[0]; return node instanceof HTMLElement ? node : undefined }
    private get nativeControl(): HTMLInputElement | undefined { const node = this.refs.native?.[0]; return node instanceof HTMLInputElement ? node : undefined }
    private displayValue = (): string => {
        const match = /^(?<hours>[01]\d|2[0-3]):(?<minutes>[0-5]\d)$/.exec(this.value)
        return match?.groups ? this.formatTime(Number(match.groups.hours), Number(match.groups.minutes)) : text(this.placeholder)
    }
    private validationError(): boolean { return Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText))) }
    private descriptionText = (): string | null => { return [text(this.description), this.validationError() ? this.validationMessage : ''].filter(Boolean).join(' ') || null }
    render(): Template {
        return html`<div part="root">
            <cb-button ref="trigger" part="trigger control" exportparts="control:trigger-control,button-label:trigger-label" data-bare data-semantic-host
                id="${this.controlId}" hidden="${this.props.native}" disabled="${or(() => this.unavailable, this.props.readOnly)}"
                accessible-label="${() => [this.accessibleName(), this.displayValue()].filter(Boolean).join(': ')}"
                aria-haspopup="listbox" aria-controls="${this.controlId}-popup" aria-expanded="${when(this.props.open, 'true', 'false')}"
                aria-invalid="${() => this.validationError() ? 'true' : null}" aria-description="${this.descriptionText}"
                onaction="${(event: Event) => { event.stopPropagation(); this.setOpen(!this.open, event) }}" onkeydown="${this.handleKey}">
                <span part="value">${this.displayValue}</span><cb-icon part="icon" name="clock" decorative="true"></cb-icon>
            </cb-button>
            <div ref="popup" part="popup listbox" role="listbox" id="${this.controlId}-popup" aria-label="${this.accessibleName}" hidden onkeydown="${this.handleKey}">
                ${repeat(this.timeOptions, option => html`<cb-button ref="options" part="option" exportparts="control:option-control,label:option-label,button-label:option-label,icon:option-icon,description:option-description" data-bare data-semantic-host role="option"
                    label="${option.label}" accessible-label="${option.label}" aria-selected="${when(is(() => option.value === this.value), 'true', 'false')}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.setValue(option.value, event); this.trigger?.focus() }}"></cb-button>`, { key: option => option.value })}
            </div>
            <input ref="native" part="native control" type="time" id="${this.controlId}-native" hidden="${isNot(this.props.native)}"
                value="${this.props.value}" min="${this.props.min}" max="${this.props.max}" step="${this.interval}"
                disabled="${() => this.unavailable}" readonly="${this.props.readOnly}" required="${this.props.required}"
                aria-label="${this.accessibleName}" aria-invalid="${() => this.validationError() ? 'true' : null}" aria-description="${this.descriptionText}"
                oninput="${(event: Event) => { const input = event.currentTarget; if (input instanceof HTMLInputElement && !this.setValue(input.value, event)) input.value = this.value }}"
                onblur="${() => { this.validationShown = true }}">
        </div>`
    }
    protected mount(): void {
        if (this.popup && this.trigger) {
            this.popupController = new PopupController(this.popup, this.trigger, () => this.setOpen(false), {
                placement: () => 'bottom-start', matchAnchorWidth: true,
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
            queueMicrotask(() => elementRefs(this.refs.options).find(node => node.getAttribute('aria-selected') === 'true')?.scrollIntoView({ block: 'center' }))
        }
        if (!this.popupController) this.popup.hidden = bool(this.native) || !bool(this.open)
    }
    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options) }
    private timeOptions = (): Array<{ value: string; label: string }> => {
        const result: Array<{ value: string; label: string }> = []
        for (let seconds = 0; seconds < 86400; seconds += this.interval()) {
            const hours = Math.floor(seconds / 3600), minutes = Math.floor((seconds % 3600) / 60)
            const value = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
            if ((this.min && value < this.min) || (this.max && value > this.max)) continue
            result.push({ value, label: this.formatTime(hours, minutes) })
        }
        return result
    }
    private formatTime(hours: number, minutes: number): string { return new Intl.DateTimeFormat(this.documentLanguage(), { hour: 'numeric', minute: '2-digit' }).format(new Date(2024, 0, 1, hours, minutes)); }
    private optionNodes(): HTMLElement[] { return elementRefs(this.refs.options).filter(node => !node.hasAttribute('disabled')); }
    private handleKey = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.setOpen(false, event);
            this.trigger?.focus();
            return;
        }
        if (!this.open && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            this.setOpen(true, event);
            const options = this.optionNodes();
            (options.find(option => option.getAttribute('aria-selected') === 'true') ?? (event.key === 'ArrowUp' ? options.at(-1) : options[0]))?.focus();
            return;
        }
        const options = this.optionNodes();
        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && options.length) {
            event.preventDefault();
            const active = this.activeNode();
            const current = active?.localName === 'cb-button' ? options.indexOf(active as Button) : -1;
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            options[current < 0 ? 0 : (current + direction + options.length) % options.length]?.focus();
        }
    }
}
export { TimePickerBase };
export type { TimePickerProps } from './TimePickerBase.js';

register('cb-time-picker', TimePicker)
