import { actionLabel, createIconButton } from '../../action/create.js'
import type { Button } from '../../action/button/index.js'
import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { EditableLabelBase } from './EditableLabelBase.js'

const css = editorCSS + `
:host{display:inline-block;max-inline-size:100%}[part~=root]{display:inline-grid;min-inline-size:0}
[part~=display]{display:inline-flex;align-items:center;min-block-size:var(--cb-height);max-inline-size:100%;padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:1px solid transparent;border-radius:var(--radius-sm);background:transparent;color:inherit;font:inherit;text-align:start;cursor:text}
[part~=display]:hover{border-color:var(--color-separator);background:var(--color-active)}[part~=display]:focus-visible{outline:var(--focus-ring);outline-offset:2px}
[part~=display][data-empty]{color:var(--color-muted-foreground);font-style:italic}[part~=editor]{display:grid;grid-template-columns:minmax(120px,1fr) auto auto;align-items:center;gap:var(--spacing-xs,4px)}
[part~=input]{min-block-size:var(--cb-height);min-inline-size:0;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-background);color:var(--color-foreground);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);font:inherit}
[part~=input]:focus{outline:var(--focus-ring);outline-offset:1px}[part~=error]{color:var(--color-danger);font-size:var(--component-caption-font-size,11px)}
`

export class EditableLabel extends EditableLabelBase {
    private rootNode?: HTMLElement
    private display?: HTMLButtonElement
    private editor?: HTMLElement
    private input?: HTMLInputElement
    private save?: Button
    private cancel?: Button
    private error?: HTMLElement

    render(): Node {
        this.rootNode = el('span', 'root')
        this.display = el('button', 'display')
        this.display.type = 'button'
        this.display.addEventListener('click', event => this.startEditing(event))
        this.display.addEventListener('keydown', event => {
            if (event.key !== 'F2') return
            event.preventDefault()
            this.startEditing(event)
        })
        this.editor = el('span', 'editor')
        this.input = el('input', 'input')
        this.input.type = 'text'
        this.input.addEventListener('input', event => {
            if (!this.input) return
            this.changeDraft(this.input.value, event)
        })
        this.input.addEventListener('keydown', event => {
            if (event.key === 'Enter') { event.preventDefault(); this.commitEditing(this.input?.value, event) }
            else if (event.key === 'Escape') { event.preventDefault(); this.cancelEditing(event) }
        })
        this.editor.addEventListener('focusout', event => {
            if (!bool(this.submitOnBlur) || !this.editor || event.relatedTarget instanceof Node && this.editor.contains(event.relatedTarget)) return
            queueMicrotask(() => { if (bool(this.editing)) this.commitEditing(this.input?.value) })
        })
        this.save = createIconButton('save', 'check', event => this.commitEditing(this.input?.value, event))
        this.cancel = createIconButton('cancel', 'close', event => this.cancelEditing(event))
        this.editor.append(this.input, this.save, this.cancel)
        this.error = el('span', 'error')
        this.error.setAttribute('role', 'alert')
        this.rootNode.append(this.display, this.editor, this.error)
        return fragment(sheet(css), this.rootNode)
    }

    protected fieldElement(): HTMLInputElement | undefined { return this.input }
    protected syncView(): void {
        if (!this.display || !this.editor || !this.input || !this.save || !this.cancel || !this.error) return
        const editing = bool(this.editing)
        const value = scalarText(this.value)
        this.input.value = editing ? this.draft : value
        this.input.placeholder = scalarText(this.placeholder)
        this.input.disabled = this.unavailable
        this.input.readOnly = bool(this.readOnly)
        this.input.required = bool(this.required)
        this.syncForm(value)
        const error = this.validationShown ? this.validationMessage : scalarText(this.errorText)
        this.display.hidden = editing
        this.display.textContent = this.displayValue()
        this.display.disabled = this.unavailable || bool(this.readOnly)
        this.display.toggleAttribute('data-empty', !value)
        aria(this.display, 'aria-label', scalarText(this.editLabel).replaceAll('{value}', value) || this.accessibleName())
        this.editor.hidden = !editing
        aria(this.input, 'aria-label', this.accessibleName() || scalarText(this.editLabel))
        actionLabel(this.save, scalarText(this.saveLabel))
        actionLabel(this.cancel, scalarText(this.cancelLabel))
        this.save.disabled = this.unavailable || bool(this.readOnly)
        this.cancel.disabled = this.unavailable
        this.error.textContent = error
        this.error.hidden = !error
        this.toggleAttribute('data-editing', editing)
        if (editing) queueMicrotask(() => {
            if (!this.input || this.activeNode() === this.input) return
            this.input.focus()
            if (bool(this.selectOnEdit)) this.input.select()
        })
    }
}

register('cb-editable-label', EditableLabel)
export { EditableLabelBase }
export type { EditableLabelProps } from './EditableLabelBase.js'
