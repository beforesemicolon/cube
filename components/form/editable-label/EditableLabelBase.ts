import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'
import { bool, scalarText } from '../../core/value.js'
import { state } from '../../core/runtime.js'

export interface EditableLabelProps extends FieldControlProps {
    value?: string
    placeholder?: string
    editing?: boolean
    selectOnEdit?: boolean
    submitOnBlur?: boolean
    editLabel?: string
    saveLabel?: string
    cancelLabel?: string
    emptyLabel?: string
}

/** Inline-editing behavior with explicit start, commit and cancel transitions. */
export abstract class EditableLabelBase<P extends EditableLabelProps = EditableLabelProps> extends FieldControlBase<P> {
    static observedAttributes = [
        ...FieldControlBase.observedAttributes, 'value', 'placeholder', 'editing', 'select-on-edit', 'submit-on-blur',
        'edit-label', 'save-label', 'cancel-label', 'empty-label',
    ]
    value = ''
    placeholder = ''
    editing = false
    selectOnEdit = true
    submitOnBlur = true
    editLabel = ''
    saveLabel = ''
    cancelLabel = ''
    emptyLabel = ''
    private readonly draftValue = state('')
    protected get draft(): string { return this.draftValue[0]() }
    protected set draft(value: string) { this.draftValue[1](value) }
    private editStartValue = ''

    protected captureValue(): string { return scalarText(this.value) }
    protected restoreValue(value: string | FormRestoreValue): void { this.value = value instanceof FormData ? scalarText(value.get(this.name)) : scalarText(value); this.draft = this.value }
    protected displayValue(): string { return scalarText(this.value) || scalarText(this.emptyLabel) || scalarText(this.placeholder) }

    startEditing(originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly) || bool(this.editing)) return false
        const detail = { value: scalarText(this.value), originalEvent }
        if (!this.request('beforeedit', detail)) return false
        this.draft = scalarText(this.value)
        this.editStartValue = this.draft
        this.editing = true
        this.syncView()
        this.emit('editstart', detail)
        return true
    }

    commitEditing(value = this.draft, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly) || !bool(this.editing)) return false
        const next = scalarText(value)
        if (next !== this.value && !this.changeDraft(next, originalEvent)) return false
        const detail = { value: next, previousValue: this.editStartValue, originalEvent }
        this.editing = false
        this.validationShown = true
        this.syncView()
        this.emit('editend', { ...detail, reason: 'commit' })
        return true
    }

    changeDraft(value: string, originalEvent?: Event): boolean {
        if (!bool(this.editing)) return false
        const next = scalarText(value)
        return this.commitValue(next,originalEvent,{},changed=>{this.value=changed;this.draft=changed})
    }

    cancelEditing(originalEvent?: Event): boolean {
        if (!bool(this.editing)) return false
        const detail = { value: this.editStartValue, draft: this.draft, originalEvent }
        if (!this.request('beforeeditcancel', detail)) return false
        const changed = this.value !== this.editStartValue
        const previousValue = this.value
        this.value = this.editStartValue
        this.draft = this.editStartValue
        this.editing = false
        this.syncView()
        if (changed) this.emit('change', { value: this.value, previousValue, originalEvent, reason: 'cancel' })
        this.emit('editend', { ...detail, reason: 'cancel' })
        return true
    }
}
