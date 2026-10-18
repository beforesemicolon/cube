import '../calendar/index.js'
import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, uid } from '../../core/editor-dom.js'
import { createIcon } from '../../icons/paths.js'
import { bool, text } from '../../core/value.js'
import { DatePickerBase } from './DatePickerBase.js'
import type { Calendar } from '../calendar/index.js'

const css = editorCSS + `:host{display:inline-block;inline-size:var(--component-date-picker-width,240px)}[part~=field]{position:relative;display:grid;gap:var(--spacing-xs,4px)}[part~=trigger]{display:flex;align-items:center;justify-content:space-between;inline-size:100%;text-align:start}[part~=popup]{position:absolute;z-index:var(--z-index-dropdown,1000);inset:calc(100% + 4px) auto auto 0}[part~=native]{inline-size:100%;color-scheme:inherit}`
export class DatePicker extends DatePickerBase {
    private nativeControl?: HTMLInputElement; private trigger?: HTMLButtonElement; private valueNode?: HTMLElement; private popup?: HTMLElement; private calendar?: Calendar; private labelNode?: HTMLLabelElement; private descriptionNode?: HTMLElement; private errorNode?: HTMLElement
    render(): Node {
        const field = el('div', 'field'); this.labelNode = el('label', 'label'); this.trigger = el('button', 'trigger control'); this.trigger.type = 'button'; this.trigger.id = uid('cb-date-picker'); this.valueNode = el('span', 'value'); this.trigger.append(this.valueNode, createIcon('calendar', 'icon'))
        this.popup = el('div', 'popup'); this.popup.id = `${this.trigger.id}-popup`; this.popup.setAttribute('role', 'dialog'); this.calendar = document.createElement('cb-calendar') as Calendar; this.popup.append(this.calendar)
        this.nativeControl = el('input', 'native control'); this.nativeControl.type = 'date'; this.nativeControl.id = `${this.trigger.id}-native`
        this.descriptionNode = el('p', 'description'); this.descriptionNode.id = `${this.trigger.id}-description`; this.errorNode = el('p', 'error'); this.errorNode.id = `${this.trigger.id}-error`
        this.trigger.addEventListener('click', event => this.setOpen(!this.open, event)); field.addEventListener('keydown', event => { if (event.key === 'Escape') { this.setOpen(false, event); this.trigger?.focus() } })
        this.calendar.addEventListener('cb-change', event => { const detail = (event as CustomEvent<{ value: string }>).detail; this.setValue(detail.value, event); this.trigger?.focus() })
        this.nativeControl.addEventListener('change', event => this.setValue(this.nativeControl!.value, event)); this.nativeControl.addEventListener('blur', () => { this.validationShown = true; this.syncView() })
        field.append(this.labelNode, this.trigger, this.popup, this.nativeControl, this.descriptionNode, this.errorNode); return fragment(sheet(css), field)
    }
    protected mount(): void { super.mount(); this.listen(this.ownerDocument, 'pointerdown', event => { if (!event.composedPath().includes(this)) this.setOpen(false, event) }) }
    protected fieldElement(): HTMLInputElement | undefined { return this.nativeControl }
    protected syncView(): void {
        if (!this.nativeControl || !this.trigger || !this.valueNode || !this.popup || !this.calendar || !this.labelNode || !this.descriptionNode || !this.errorNode) return
        const native = bool(this.native); this.nativeControl.hidden = !native; this.trigger.hidden = native; this.popup.hidden = native || !this.open
        this.nativeControl.value = this.value; this.nativeControl.min = this.min; this.nativeControl.max = this.max; this.nativeControl.disabled = this.unavailable; this.nativeControl.readOnly = bool(this.readOnly); this.nativeControl.required = bool(this.required)
        Object.assign(this.calendar, { value: this.value, min: this.min, max: this.max, previousLabel: this.previousLabel, nextLabel: this.nextLabel, disabled: this.unavailable || bool(this.readOnly), accessibleLabel: this.accessibleName() })
        const selected = this.value ? new Date(`${this.value}T12:00:00`) : undefined; this.valueNode.textContent = selected && !Number.isNaN(selected.valueOf()) ? new Intl.DateTimeFormat(this.documentLanguage(), { dateStyle: 'medium' }).format(selected) : text(this.placeholder)
        const accessibleName = this.accessibleName(), visibleValue = this.valueNode.textContent ?? ''
        this.trigger.setAttribute('aria-label', accessibleName && visibleValue ? `${accessibleName}: ${visibleValue}` : accessibleName || visibleValue)
        this.trigger.disabled = this.unavailable || bool(this.readOnly); this.trigger.setAttribute('aria-haspopup', 'dialog'); this.trigger.setAttribute('aria-controls', this.popup.id); aria(this.trigger, 'aria-expanded', this.open)
        this.labelNode.htmlFor = native ? this.nativeControl.id : this.trigger.id; this.labelNode.textContent = text(this.label); this.labelNode.hidden = !text(this.label); this.descriptionNode.textContent = text(this.description); this.descriptionNode.hidden = !text(this.description)
        this.syncForm(this.value); const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText))); this.errorNode.textContent = error ? this.validationMessage : ''; this.errorNode.hidden = !error
        const describedBy = [text(this.description) ? this.descriptionNode.id : '', error ? this.errorNode.id : ''].filter(Boolean).join(' ') || null
        aria(this.trigger, 'aria-invalid', error ? true : null); aria(this.nativeControl, 'aria-invalid', error ? true : null); aria(this.trigger, 'aria-describedby', describedBy); aria(this.nativeControl, 'aria-describedby', describedBy)
    }
    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options) }
}
register('cb-date-picker', DatePicker)
export { DatePickerBase }
export type { DatePickerProps } from './DatePickerBase.js'
