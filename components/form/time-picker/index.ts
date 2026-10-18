import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, uid } from '../../core/editor-dom.js'
import { createIcon } from '../../icons/paths.js'
import { bool, text } from '../../core/value.js'
import { TimePickerBase } from './TimePickerBase.js'

const css = editorCSS + `
:host{display:inline-block;inline-size:var(--component-time-picker-width,220px)}
[part~=field]{position:relative;display:grid;gap:var(--spacing-xs,4px)}
[part~=trigger]{display:flex;align-items:center;justify-content:space-between;inline-size:100%;text-align:start}
[part~=popup]{position:absolute;z-index:var(--z-index-dropdown,1000);inset:calc(100% + 4px) 0 auto;max-block-size:240px;overflow:auto;padding:4px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);box-shadow:var(--shadow-md,0 12px 32px rgba(0,0,0,.14))}
[part~=option]{inline-size:100%;border-color:transparent;background:transparent;text-align:start}
[part~=option][aria-selected=true]{background:var(--color-selection);color:var(--color-signal-text)}
[part~=native]{inline-size:100%;color-scheme:inherit}
`

export class TimePicker extends TimePickerBase {
    private nativeControl?: HTMLInputElement
    private trigger?: HTMLButtonElement
    private valueNode?: HTMLElement
    private popup?: HTMLElement
    private labelNode?: HTMLLabelElement
    private descriptionNode?: HTMLElement
    private errorNode?: HTMLElement

    render(): Node {
        const field = el('div', 'field')
        this.labelNode = el('label', 'label')
        this.trigger = el('button', 'trigger control')
        this.trigger.type = 'button'
        this.trigger.id = uid('cb-time-picker')
        this.valueNode = el('span', 'value')
        this.trigger.append(this.valueNode, createIcon('clock', 'icon'))
        this.popup = el('div', 'popup listbox')
        this.popup.id = `${this.trigger.id}-popup`
        this.popup.setAttribute('role', 'listbox')
        this.nativeControl = el('input', 'native control')
        this.nativeControl.type = 'time'
        this.nativeControl.id = `${this.trigger.id}-native`
        this.descriptionNode = el('p', 'description')
        this.descriptionNode.id = `${this.trigger.id}-description`
        this.errorNode = el('p', 'error')
        this.errorNode.id = `${this.trigger.id}-error`
        this.trigger.addEventListener('click', event => this.setOpen(!this.open, event))
        this.trigger.addEventListener('keydown', event => this.handleKey(event))
        this.popup.addEventListener('keydown', event => this.handleKey(event))
        this.nativeControl.addEventListener('change', event => this.setValue(this.nativeControl!.value, event))
        this.nativeControl.addEventListener('blur', () => { this.validationShown = true; this.syncView() })
        field.append(this.labelNode, this.trigger, this.popup, this.nativeControl, this.descriptionNode, this.errorNode)
        return fragment(sheet(css), field)
    }

    protected mount(): void {
        super.mount()
        this.listen(this.ownerDocument, 'pointerdown', event => {
            if (!event.composedPath().includes(this)) this.setOpen(false, event)
        })
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.nativeControl }

    protected syncView(): void {
        if (!this.nativeControl || !this.trigger || !this.valueNode || !this.popup || !this.labelNode || !this.descriptionNode || !this.errorNode) return
        const native = bool(this.native)
        this.nativeControl.hidden = !native
        this.trigger.hidden = native
        this.popup.hidden = native || !this.open
        this.nativeControl.value = this.value
        this.nativeControl.min = this.min
        this.nativeControl.max = this.max
        this.nativeControl.step = String(this.interval())
        this.nativeControl.disabled = this.unavailable
        this.nativeControl.readOnly = bool(this.readOnly)
        this.nativeControl.required = bool(this.required)
        this.popup.replaceChildren()
        for (let seconds = 0; seconds < 86400; seconds += this.interval()) {
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)
            const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
            if ((this.min && value < this.min) || (this.max && value > this.max)) continue
            const option = el('button', 'option', this.formatTime(hours, minutes))
            option.type = 'button'
            option.setAttribute('role', 'option')
            aria(option, 'aria-selected', value === this.value)
            option.addEventListener('click', event => { this.setValue(value, event); this.trigger?.focus() })
            this.popup.append(option)
        }
        const match = /^(?<hours>[01]\d|2[0-3]):(?<minutes>[0-5]\d)$/.exec(this.value)
        this.valueNode.textContent = match?.groups ? this.formatTime(Number(match.groups.hours), Number(match.groups.minutes)) : this.ui('choose')
        this.trigger.disabled = this.unavailable || bool(this.readOnly)
        this.trigger.setAttribute('aria-haspopup', 'listbox')
        this.trigger.setAttribute('aria-controls', this.popup.id)
        aria(this.trigger, 'aria-expanded', this.open)
        this.labelNode.htmlFor = native ? this.nativeControl.id : this.trigger.id
        this.labelNode.textContent = text(this.label)
        this.labelNode.hidden = !text(this.label)
        this.descriptionNode.textContent = text(this.description)
        this.descriptionNode.hidden = !text(this.description)
        this.syncForm(this.value)
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText)))
        this.errorNode.textContent = error ? this.validationMessage : ''
        this.errorNode.hidden = !error
        const describedBy = [text(this.description) ? this.descriptionNode.id : '', error ? this.errorNode.id : ''].filter(Boolean).join(' ') || null
        aria(this.trigger, 'aria-describedby', describedBy)
        aria(this.nativeControl, 'aria-describedby', describedBy)
        aria(this.trigger, 'aria-invalid', error ? true : null)
    }

    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options) }
    private formatTime(hours: number, minutes: number): string { return new Intl.DateTimeFormat(this.language(), { hour: 'numeric', minute: '2-digit' }).format(new Date(2024, 0, 1, hours, minutes)) }
    private optionNodes(): HTMLButtonElement[] { return [...(this.popup?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])] }
    private handleKey(event: KeyboardEvent): void {
        if (event.key === 'Escape') { event.preventDefault(); this.setOpen(false, event); this.trigger?.focus(); return }
        if (!this.open && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); this.setOpen(true, event); const options = this.optionNodes(); (options.find(option => option.getAttribute('aria-selected') === 'true') ?? (event.key === 'ArrowUp' ? options.at(-1) : options[0]))?.focus(); return }
        const options = this.optionNodes()
        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && options.length) {
            event.preventDefault()
            const active = this.activeNode()
            const current = active instanceof HTMLButtonElement ? options.indexOf(active) : -1
            const direction = event.key === 'ArrowDown' ? 1 : -1
            options[current < 0 ? 0 : (current + direction + options.length) % options.length]?.focus()
        }
    }
}

register('cb-time-picker', TimePicker)
export { TimePickerBase }
export type { TimePickerProps } from './TimePickerBase.js'
