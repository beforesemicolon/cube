import '../text-input/index.js'
import type { TextInput } from '../text-input/index.js'
import { actionLabel, createButton, createIconButton } from '../../action/create.js'
import type { Button } from '../../action/button/index.js'
import type { IconButton } from '../../action/icon-button/index.js'
import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { EditableListBase, type EditableListItem } from './EditableListBase.js'

const css = editorCSS + `
:host{display:block;inline-size:var(--component-editable-list-width,420px);max-inline-size:100%;min-inline-size:min(100%,var(--component-editable-list-min-width,320px))}
[part~=editor]{display:grid;gap:var(--spacing-sm,8px)}[part~=list]{display:grid;gap:var(--spacing-xs,4px);margin:0;padding:0;list-style:none}
[part~=item]{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:var(--spacing-sm,8px);min-block-size:var(--cb-height);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:1px solid var(--color-separator);border-radius:var(--radius-sm);background:var(--color-surface)}
[part~=item-copy]{display:grid;min-inline-size:0}[part~=item-label]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}[part~=item-description]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px)}
[part~=item-actions],[part~=add-row],[part~=edit-actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px)}[part~=add-input],[part~=edit-input]{display:block;min-inline-size:0;flex:1}
[part~=empty]{padding:var(--spacing-md,12px);border:1px dashed var(--color-separator);border-radius:var(--radius-sm);color:var(--color-muted-foreground);text-align:center}
`

export class EditableList extends EditableListBase {
    private editor?: HTMLElement
    private list?: HTMLElement
    private addInput?: TextInput
    private addButton?: Button
    private editingId = ''
    private addValue = ''

    render(): Node {
        this.editor = el('div', 'editor')
        this.editor.setAttribute('role', 'group')
        this.list = el('ul', 'list')
        const addRow = el('div', 'add-row')
        this.addInput = document.createElement('cb-text-input') as TextInput
        this.addInput.setAttribute('part', 'add-input')
        this.addInput.addEventListener('input', event => { this.addValue = this.inputValue(event, this.addValue) })
        this.addInput.addEventListener('cb-change', () => { this.addValue = scalarText(this.addInput?.value) })
        this.addInput.addEventListener('keydown', event => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            this.addDraft(event)
        })
        this.addButton = createButton('add', event => this.addDraft(event))
        addRow.append(this.addInput, this.addButton)
        this.editor.append(this.list, addRow)
        return fragment(sheet(css), this.editor)
    }

    protected syncView(): void {
        if (!this.editor || !this.list || !this.addInput || !this.addButton) return
        const items = this.normalizedItems()
        this.syncListForm()
        const error = this.validationShown ? this.validationMessage : scalarText(this.errorText)
        this.editor.setAttribute('aria-label', this.accessibleName())
        this.editor.setAttribute('aria-description', [scalarText(this.description), error].filter(Boolean).join(' '))
        aria(this.editor, 'aria-invalid', error ? true : null)
        this.toggleAttribute('data-invalid', Boolean(error))
        this.list.replaceChildren(...items.map((item, index) => this.itemNode(item, index, items.length)))
        if (!items.length) {
            const empty = el('li', 'empty', scalarText(this.emptyLabel))
            empty.setAttribute('role', 'status')
            this.list.append(empty)
        }
        Object.assign(this.addInput, {
            label: '', accessibleLabel: scalarText(this.inputLabel), placeholder: scalarText(this.placeholder),
            disabled: this.unavailable || bool(this.readOnly) || items.length >= this.maximumItems(),
        })
        actionLabel(this.addButton, scalarText(this.addLabel))
        this.addButton.disabled = this.unavailable || bool(this.readOnly) || items.length >= this.maximumItems()
    }

    focus(options?: FocusOptions): void { this.addInput?.focus(options) }

    private itemNode(item: EditableListItem, index: number, count: number): HTMLElement {
        const row = el('li', 'item')
        row.dataset.id = item.id
        if (this.editingId === item.id) {
            const input = document.createElement('cb-text-input') as TextInput
            input.setAttribute('part', 'edit-input')
            Object.assign(input, { label: '', accessibleLabel: scalarText(this.inputLabel), value: item.label, disabled: this.unavailable || item.disabled })
            let draft = item.label
            input.addEventListener('input', event => { draft = this.inputValue(event, draft) })
            input.addEventListener('cb-change', () => { draft = scalarText(input.value) })
            const actions = el('div', 'edit-actions')
            const commit = (event?: Event): void => {
                if (this.updateItem(item.id, draft, event)) this.editingId = ''
                this.syncView()
            }
            const dismiss = (): void => { this.editingId = ''; this.syncView() }
            const save = createButton('save', event => commit(event))
            const cancel = createButton('cancel', dismiss)
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') { event.preventDefault(); commit(event) }
                else if (event.key === 'Escape') { event.preventDefault(); dismiss() }
            })
            actionLabel(save, scalarText(this.saveLabel)); actionLabel(cancel, scalarText(this.cancelLabel))
            actions.append(save, cancel)
            row.append(input, actions)
            queueMicrotask(() => input.focus())
            return row
        }
        const copy = el('span', 'item-copy')
        copy.append(el('span', 'item-label', item.label))
        if (item.description) copy.append(el('span', 'item-description', item.description))
        const actions = el('div', 'item-actions')
        const edit = this.iconAction('edit', 'text', this.itemActionLabel(this.editLabel, item), event => { this.editingId = item.id; this.syncView(); event.stopPropagation() })
        const up = this.iconAction('move-up', 'up', this.itemActionLabel(this.moveUpLabel, item), event => this.moveItem(item.id, -1, event))
        const down = this.iconAction('move-down', 'down', this.itemActionLabel(this.moveDownLabel, item), event => this.moveItem(item.id, 1, event))
        const remove = this.iconAction('remove', 'close', this.itemActionLabel(this.removeLabel, item), event => this.removeItem(item.id, event))
        const disabled = this.unavailable || bool(this.readOnly) || item.disabled === true
        edit.disabled = disabled
        up.disabled = disabled || !bool(this.allowReorder) || index === 0
        down.disabled = disabled || !bool(this.allowReorder) || index === count - 1
        remove.disabled = disabled || count <= this.minimumItems()
        actions.append(edit, up, down, remove)
        row.append(copy, actions)
        return row
    }

    private iconAction(part: string, icon: string, label: string, handler: (event: CustomEvent) => void): IconButton {
        const button = createIconButton(part, icon, handler)
        actionLabel(button, label)
        button.size = 'xs'
        return button
    }

    private itemActionLabel(template: string, item: EditableListItem): string { return scalarText(template).replaceAll('{item}', item.label) }
    private inputValue(event: Event, fallback: string): string {
        const control = event.composedPath().find(node => node instanceof HTMLInputElement)
        return control instanceof HTMLInputElement ? control.value : fallback
    }
    private addDraft(event: Event): void {
        if (!this.addInput) return
        if (this.addItem(this.addValue, event)) {
            this.addValue = ''
            this.addInput.value = ''
        }
    }
}

register('cb-editable-list', EditableList)
export { EditableListBase }
export type { EditableListProps, EditableListItem, EditableListChangeReason } from './EditableListBase.js'
