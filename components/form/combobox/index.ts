import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, uid } from '../../core/editor-dom.js'
import { createIcon } from '../../icons/paths.js'
import { actionLabel, createIconButton } from '../../action/create.js'
import type { IconButton } from '../../action/icon-button/index.js'
import { text } from '../../core/value.js'
import { PopupController } from '../../core/popup.js'
import { ComboboxBase } from './ComboboxBase.js'

const css = editorCSS + `
:host{display:inline-block;inline-size:var(--component-combobox-width,280px)}[part~=field]{position:relative;display:grid;gap:var(--spacing-xs,4px)}[part~=input-shell]{display:flex;align-items:center;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-muted)}
[part~=input]{inline-size:100%;border:0;background:transparent;outline:0}[part~=toggle]{align-self:stretch}[part~=toggle]::part(toggle-control){block-size:100%;border-radius:0 var(--radius-sm) var(--radius-sm) 0}
    [part~=popup]{z-index:var(--z-index-dropdown,1000);inline-size:max-content;box-sizing:border-box;overflow:auto;padding:4px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);color:var(--color-foreground);box-shadow:var(--shadow-md,0 12px 32px rgba(0,0,0,.14))}
[part~=option]{display:flex;inline-size:100%;border-color:transparent;background:transparent;text-align:start}[part~=option][aria-selected=true]{background:var(--color-selection)}[part~=empty]{display:block;padding:10px;color:var(--color-muted-foreground)}
`

export class Combobox extends ComboboxBase {
    private input?: HTMLInputElement
    private inputShell?: HTMLElement
    private popup?: HTMLElement
    private popupController?: PopupController
    private toggleButton?: IconButton
    private labelNode?: HTMLLabelElement
    private descriptionNode?: HTMLElement
    private errorNode?: HTMLElement
    render(): Node {
        const field = el('div', 'field'); this.labelNode = el('label', 'label')
        this.inputShell = el('div', 'input-shell control'); this.input = el('input', 'input'); this.input.type = 'text'; this.input.id = uid('cb-combobox')
        this.toggleButton = createIconButton('toggle', 'down', event => { this.setOpen(!this.open, event); this.input?.focus() })
        this.popup = el('div', 'popup listbox'); this.popup.id = `${this.input.id}-popup`; this.popup.setAttribute('role', 'listbox')
        this.descriptionNode = el('p', 'description'); this.descriptionNode.id = `${this.input.id}-description`
        this.errorNode = el('p', 'error'); this.errorNode.id = `${this.input.id}-error`
        this.input.addEventListener('input', event => this.handleInput(event))
        this.input.addEventListener('focus', event => this.setOpen(true, event))
        this.input.addEventListener('keydown', event => this.handleKey(event))
        this.popup.addEventListener('keydown', event => this.handleKey(event))
        this.inputShell.append(createIcon('search', 'icon prefix'), this.input, this.toggleButton); field.append(this.labelNode, this.inputShell, this.popup, this.descriptionNode, this.errorNode)
        return fragment(sheet(css), field)
    }
    protected mount(): void {
        if (this.popup && this.inputShell) {
            this.popupController = new PopupController(this.popup, this.inputShell, () => this.setOpen(false), {
                placement: () => 'bottom-start',
                matchAnchorWidth: true,
                maxWidth: () => this.popupMaxWidth,
                maxHeight: () => this.popupMaxHeight,
            })
            this.cleanup(() => this.popupController?.dispose())
        }
        super.mount()
        this.syncPopup()
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.input }
    protected syncView(): void {
        if (!this.input || !this.popup || !this.toggleButton || !this.labelNode || !this.descriptionNode || !this.errorNode) return
        const selected = this.normalizedOptions.find(option => option.value === this.value)
        const displayValue = selected?.label ?? this.value
        if (this.input.value !== displayValue) this.input.value = displayValue
        this.input.placeholder = text(this.placeholder); this.input.disabled = this.unavailable; this.input.readOnly = this.readOnly; this.input.required = this.required
        this.input.setAttribute('role', 'combobox'); this.input.setAttribute('aria-autocomplete', this.autocomplete ?? 'list'); this.input.setAttribute('aria-controls', this.popup.id); aria(this.input, 'aria-expanded', this.open)
        actionLabel(this.toggleButton, text(this.toggleLabel))
        this.toggleButton.disabled = this.unavailable || this.readOnly
        this.toggleButton.popupType = 'listbox'
        this.toggleButton.popupExpanded = this.open
        this.toggleButton.popupControls = this.popup.id
        this.popup.replaceChildren(); const options = this.filteredOptions()
        for (const option of options) { const button = el('button', 'option', option.label); button.type = 'button'; button.disabled = option.disabled; button.dataset.value = option.value; button.setAttribute('role', 'option'); aria(button, 'aria-selected', option.value === this.value); button.addEventListener('click', event => { this.setValue(option.value, event); this.setOpen(false, event); this.input?.focus() }); this.popup.append(button) }
        if (!options.length && text(this.emptyLabel)) this.popup.append(el('span', 'empty', text(this.emptyLabel)))
        this.syncPopup()
        this.labelNode.htmlFor = this.input.id; this.labelNode.textContent = text(this.label); this.labelNode.hidden = !text(this.label)
        this.descriptionNode.textContent = text(this.description); this.descriptionNode.hidden = !text(this.description)
        this.syncForm(this.value); const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText))); this.errorNode.textContent = error ? this.validationMessage : ''; this.errorNode.hidden = !error
        aria(this.input, 'aria-invalid', error ? true : null); aria(this.input, 'aria-describedby', [text(this.description) ? this.descriptionNode.id : '', error ? this.errorNode.id : ''].filter(Boolean).join(' ') || null)
    }
    private syncPopup(): void {
        if (!this.popup) return
        if (this.open) this.popupController?.show(); else this.popupController?.hide()
        if (!this.popupController) this.popup.hidden = !this.open
    }
    private handleInput(event: Event): void {
        if (!this.input) return
        const query = this.input.value
        this.setValue(query, event)
        this.setOpen(true, event)
        if (this.autocomplete !== 'both' || !query) return
        const match = this.normalizedOptions.find(option => !option.disabled && option.label.toLocaleLowerCase().startsWith(query.toLocaleLowerCase()))
        if (!match) return
        this.input.value = match.label
        this.input.setSelectionRange(query.length, match.label.length)
    }
    private handleKey(event: KeyboardEvent): void {
        if (event.key === 'Escape') { event.preventDefault(); this.setOpen(false, event); this.input?.focus(); return }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (!this.open) this.setOpen(true, event)
            const options = [...(this.popup?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])]
            const active = this.activeNode()
            const current = active instanceof HTMLButtonElement ? options.indexOf(active) : -1
            const direction = event.key === 'ArrowDown' ? 1 : -1
            options[current < 0 ? (direction > 0 ? 0 : options.length - 1) : (current + direction + options.length) % options.length]?.focus()
        }
        const active = this.activeNode()
        if (event.key === 'Enter' && active instanceof HTMLButtonElement) { event.preventDefault(); active.click() }
    }
}

register('cb-combobox', Combobox)
export { ComboboxBase }
export type { ComboboxProps } from './ComboboxBase.js'
