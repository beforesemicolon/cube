import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, uid } from '../../core/editor-dom.js'
import { createIcon } from '../../icons/paths.js'
import { bool, text } from '../../core/value.js'
import { SelectBase } from './SelectBase.js'

const css = editorCSS + `
:host{display:inline-block;inline-size:var(--component-select-width,240px)}[part~=field]{position:relative;display:grid;gap:var(--spacing-xs,4px)}
[part~=trigger]{display:flex;align-items:center;justify-content:space-between;gap:8px;inline-size:100%;text-align:start}[part~=value][data-placeholder]{color:var(--color-muted-foreground)}
[part~=popup]{position:absolute;z-index:var(--z-index-dropdown,1000);inset:calc(100% + 4px) 0 auto;max-block-size:240px;overflow:auto;padding:4px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);box-shadow:var(--shadow-md,0 12px 32px rgba(0,0,0,.14))}
[part~=option]{display:flex;align-items:center;justify-content:space-between;inline-size:100%;border-color:transparent;background:transparent;text-align:start}[part~=option][aria-selected=true]{background:var(--color-selection);color:var(--color-signal-text)}
[part~=native]{inline-size:100%;appearance:auto;color-scheme:inherit}
`

export class Select extends SelectBase {
    private nativeControl?: HTMLSelectElement
    private trigger?: HTMLButtonElement
    private valueNode?: HTMLElement
    private popup?: HTMLElement
    private titleNode?: HTMLLabelElement
    private descriptionNode?: HTMLElement
    private errorNode?: HTMLElement

    render(): Node {
        const field = el('div', 'field')
        this.titleNode = el('label', 'label')
        this.trigger = el('button', 'trigger control'); this.trigger.type = 'button'; this.trigger.id = uid('cb-select')
        this.valueNode = el('span', 'value'); this.trigger.append(this.valueNode, createIcon('down', 'icon indicator'))
        this.popup = el('div', 'popup listbox'); this.popup.id = `${this.trigger.id}-popup`; this.popup.setAttribute('role', 'listbox')
        this.nativeControl = el('select', 'native control'); this.nativeControl.id = `${this.trigger.id}-native`
        this.descriptionNode = el('p', 'description'); this.descriptionNode.id = `${this.trigger.id}-description`
        this.errorNode = el('p', 'error'); this.errorNode.id = `${this.trigger.id}-error`
        this.trigger.addEventListener('click', event => this.setOpen(!bool(this.open), event))
        this.trigger.addEventListener('keydown', event => this.handleKey(event))
        this.popup.addEventListener('keydown', event => this.handleKey(event))
        this.nativeControl.addEventListener('change', event => this.choose(bool(this.multiple) ? [...this.nativeControl!.selectedOptions].map(option => option.value) : this.nativeControl!.value, event))
        this.nativeControl.addEventListener('blur', () => { this.validationShown = true; this.syncView() })
        field.append(this.titleNode, this.trigger, this.popup, this.nativeControl, this.descriptionNode, this.errorNode)
        return fragment(sheet(css), field)
    }

    protected mount(): void {
        super.mount()
        this.listen(this.ownerDocument, 'pointerdown', event => {
            if (!event.composedPath().includes(this)) this.setOpen(false, event)
        })
    }
    protected fieldElement(): HTMLSelectElement | undefined { return this.nativeControl }

    protected syncView(): void {
        if (!this.nativeControl || !this.trigger || !this.valueNode || !this.popup || !this.titleNode || !this.descriptionNode || !this.errorNode) return
        const options = this.normalizedOptions, selection = this.selection, placeholder = text(this.placeholder)
        this.nativeControl.replaceChildren(); this.popup.replaceChildren()
        if (!bool(this.multiple) && !options.some(option => option.value === '')) { const empty = el('option', 'option', placeholder); empty.value = ''; this.nativeControl.append(empty) }
        for (const option of options) {
            const nativeOption = el('option', 'option', option.label); nativeOption.value = option.value; nativeOption.disabled = option.disabled; nativeOption.selected = selection.includes(option.value); this.nativeControl.append(nativeOption)
            const button = el('button', 'option', option.label); button.type = 'button'; button.dataset.value = option.value; button.disabled = option.disabled || this.unavailable; button.setAttribute('role', 'option'); aria(button, 'aria-selected', selection.includes(option.value))
            if (selection.includes(option.value)) button.append(createIcon('check', 'icon check'))
            button.addEventListener('click', event => { this.choose(option.value, event); if (!bool(this.multiple)) this.setOpen(false, event) })
            this.popup.append(button)
        }
        const labels = options.filter(option => selection.includes(option.value)).map(option => option.label)
        this.valueNode.textContent = labels.join(', ') || placeholder; this.valueNode.toggleAttribute('data-placeholder', labels.length === 0)
        const native = bool(this.native); this.trigger.hidden = native; this.popup.hidden = native || !bool(this.open); this.nativeControl.hidden = !native
        aria(this.popup, 'aria-multiselectable', bool(this.multiple) ? true : null)
        this.nativeControl.multiple = bool(this.multiple); this.nativeControl.disabled = this.unavailable || bool(this.readOnly); this.nativeControl.required = bool(this.required) && !bool(this.readOnly); this.nativeControl.setAttribute('aria-label', this.accessibleName())
        this.trigger.disabled = this.unavailable || bool(this.readOnly)
        const accessibleName = this.accessibleName()
        const visibleValue = this.valueNode.textContent ?? ''
        this.trigger.setAttribute('aria-label', visibleValue && visibleValue !== accessibleName ? `${accessibleName}: ${visibleValue}` : accessibleName)
        this.trigger.setAttribute('aria-haspopup', 'listbox'); this.trigger.setAttribute('aria-controls', this.popup.id); aria(this.trigger, 'aria-expanded', bool(this.open))
        this.titleNode.htmlFor = native ? this.nativeControl.id : this.trigger.id; this.titleNode.textContent = text(this.label); this.titleNode.hidden = !text(this.label)
        this.descriptionNode.textContent = text(this.description); this.descriptionNode.hidden = !text(this.description)
        this.syncForm(bool(this.multiple) ? this.multipleFormValue(selection) : selection[0] ?? '')
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText))); this.errorNode.textContent = error ? this.validationMessage : ''; this.errorNode.hidden = !error
        const describedBy = [text(this.description) ? this.descriptionNode.id : '', error ? this.errorNode.id : ''].filter(Boolean).join(' ') || null
        aria(this.trigger, 'aria-describedby', describedBy); aria(this.nativeControl, 'aria-describedby', describedBy); aria(this.trigger, 'aria-invalid', error ? true : null)
    }

    private multipleFormValue(values: readonly string[]): FormData { const data = new FormData(); if (this.name) for (const value of values) data.append(this.name, value); return data }
    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options) }
    private optionNodes(): HTMLButtonElement[] { return [...(this.popup?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])] }
    private handleKey(event: KeyboardEvent): void {
        if (event.key === 'Escape') { event.preventDefault(); this.setOpen(false, event); this.trigger?.focus(); return }
        if (!bool(this.open) && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault()
            this.setOpen(true, event)
            const options = this.optionNodes()
            const selected = options.find(option => option.getAttribute('aria-selected') === 'true')
            const target = selected ?? (event.key === 'ArrowUp' ? options.at(-1) : options[0])
            target?.focus()
            return
        }
        const options = this.optionNodes()
        const active = this.activeNode()
        const current = active instanceof HTMLButtonElement ? options.indexOf(active) : -1
        if (event.key === 'ArrowDown' && options.length) { event.preventDefault(); options[(current + 1) % options.length]?.focus() }
        if (event.key === 'ArrowUp' && options.length) { event.preventDefault(); options[(current - 1 + options.length) % options.length]?.focus() }
    }
}

register('cb-select', Select)
export { SelectBase }
export type { SelectProps } from './SelectBase.js'
export type { SelectOption } from '../model.js'
