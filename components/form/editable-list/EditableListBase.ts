import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'
import { bool, finite, scalarText } from '../../core/value.js'

export interface EditableListItem { id: string; label: string; value: string; description?: string; disabled?: boolean }
export type EditableListChangeReason = 'add' | 'edit' | 'remove' | 'reorder'
export interface EditableListProps extends FieldControlProps {
    items?: readonly EditableListItem[]
    minItems?: number
    maxItems?: number
    allowReorder?: boolean
    placeholder?: string
    addLabel?: string
    editLabel?: string
    saveLabel?: string
    cancelLabel?: string
    removeLabel?: string
    moveUpLabel?: string
    moveDownLabel?: string
    emptyLabel?: string
    inputLabel?: string
    minimumItemsError?: string
    maximumItemsError?: string
}

function normalizedItems(value: readonly EditableListItem[]): EditableListItem[] {
    const ids = new Set<string>()
    return Array.isArray(value) ? value.flatMap((item, index) => {
        if (!item || typeof item !== 'object') return []
        const base = scalarText(item.id).trim() || `item-${index + 1}`
        let id = base
        let duplicate = 1
        while (ids.has(id)) id = `${base}-${++duplicate}`
        ids.add(id)
        const label = scalarText(item.label)
        const itemValue = scalarText(item.value, label)
        return [{ id, label, value: itemValue, description: scalarText(item.description), disabled: bool(item.disabled) }]
    }) : []
}

/** Editable collection behavior with form submission, validation and reorder operations. */
export abstract class EditableListBase<P extends EditableListProps = EditableListProps> extends FieldControlBase<P, readonly EditableListItem[], string> {
    static observedAttributes = [
        ...FieldControlBase.observedAttributes, 'items', 'min-items', 'max-items', 'allow-reorder', 'placeholder', 'add-label',
        'edit-label', 'save-label', 'cancel-label', 'remove-label', 'move-up-label', 'move-down-label', 'empty-label',
        'input-label', 'minimum-items-error', 'maximum-items-error',
    ]
    items: readonly EditableListItem[] = []
    minItems = 0
    maxItems = Number.POSITIVE_INFINITY
    allowReorder = true
    placeholder = ''
    addLabel = ''
    editLabel = ''
    saveLabel = ''
    cancelLabel = ''
    removeLabel = ''
    moveUpLabel = ''
    moveDownLabel = ''
    emptyLabel = ''
    inputLabel = ''
    minimumItemsError = ''
    maximumItemsError = ''
    private sequence = 0

    normalizedItems = (): readonly EditableListItem[] => { return normalizedItems(this.items) }
    protected fieldElement(): undefined { return undefined }
    protected captureValue(): readonly EditableListItem[] { return this.normalizedItems().map(item => ({ ...item })) }
    protected restoreValue(value: readonly EditableListItem[] | FormRestoreValue): void {
        if (Array.isArray(value)) {
            this.items = normalizedItems(value.filter((item): item is EditableListItem => Boolean(item) && typeof item === 'object' && 'label' in item))
            return
        }
        if (value instanceof FormData) {
            this.items = value.getAll(this.name).flatMap((item, index) => typeof item === 'string' ? [{ id: `item-${index + 1}`, label: item, value: item }] : [])
            return
        }
        const text = scalarText(value)
        this.items = text ? [{ id: 'item-1', label: text, value: text }] : []
    }

    addItem(label: string, originalEvent?: Event): boolean {
        const value = scalarText(label).trim()
        if (!value || this.unavailable || bool(this.readOnly) || this.normalizedItems().length >= this.maximumItems()) return false
        const id = `item-${Date.now().toString(36)}-${++this.sequence}`
        return this.commit([...this.normalizedItems(), { id, label: value, value }], 'add', id, originalEvent)
    }

    updateItem(id: string, label: string, originalEvent?: Event): boolean {
        const value = scalarText(label).trim()
        if (!value || this.unavailable || bool(this.readOnly)) return false
        const items = this.normalizedItems()
        if (!items.some(item => item.id === id && !item.disabled)) return false
        return this.commit(items.map(item => item.id === id ? { ...item, label: value, value } : item), 'edit', id, originalEvent)
    }

    removeItem(id: string, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly) || this.normalizedItems().length <= this.minimumItems()) return false
        const items = this.normalizedItems()
        if (!items.some(item => item.id === id && !item.disabled)) return false
        return this.commit(items.filter(item => item.id !== id), 'remove', id, originalEvent)
    }

    moveItem(id: string, offset: -1 | 1, originalEvent?: Event): boolean {
        if (!bool(this.allowReorder) || this.unavailable || bool(this.readOnly)) return false
        const items = [...this.normalizedItems()]
        const from = items.findIndex(item => item.id === id && !item.disabled)
        const to = from + offset
        if (from < 0 || to < 0 || to >= items.length || items[to]?.disabled) return false
        const [item] = items.splice(from, 1)
        if (!item) return false
        items.splice(to, 0, item)
        return this.commit(items, 'reorder', id, originalEvent)
    }

    protected syncListForm(): void {
        const items = this.normalizedItems()
        const data = new FormData()
        if (this.name) for (const item of items) data.append(this.name, item.value)
        this.internals?.setFormValue(this.unavailable ? null : data, data)
        const tooFew = items.length < this.minimumItems() || bool(this.required) && items.length === 0
        const tooMany = items.length > this.maximumItems()
        const custom = scalarText(this.errorText)
        const message = custom || (tooFew ? scalarText(this.minimumItemsError) : tooMany ? scalarText(this.maximumItemsError) : '')
        this.internals?.setValidity(message ? { customError: true } : {}, message)
    }
    protected syncFormValue():void{this.syncListForm()}

    protected minimumItems(): number { return Math.max(0, Math.trunc(finite(this.minItems, 0))) }
    protected maximumItems(): number { return Math.max(this.minimumItems(), Math.trunc(finite(this.maxItems, Number.POSITIVE_INFINITY))) }
    private commit(items: readonly EditableListItem[], reason: EditableListChangeReason, id: string, originalEvent?: Event): boolean {
        const detail={items,reason,id,value:items.map(item=>item.value)}
        return this.commitState(this.normalizedItems(),items,originalEvent,detail,changed=>{
            this.items=changed
            this.validationShown=true
        },()=>false)
    }
}
