import { FormFieldBase, type FormFieldProps } from '../FormFieldBase.js'
import { bool, scalarText } from '../../core/value.js'

export interface EditableLabelProps extends FormFieldProps {
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
export abstract class EditableLabelBase<P extends EditableLabelProps = EditableLabelProps> extends FormFieldBase<P> {
    static observedAttributes = [
        ...FormFieldBase.observedAttributes, 'value', 'placeholder', 'editing', 'select-on-edit', 'submit-on-blur',
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
    protected draft = ''

    protected captureValue(): string { return scalarText(this.value) }
    protected restoreValue(value: unknown): void { this.value = scalarText(value); this.draft = this.value }
    protected displayValue(): string { return scalarText(this.value) || scalarText(this.emptyLabel) || scalarText(this.placeholder) }

    startEditing(originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly) || bool(this.editing)) return false
        const detail = { value: scalarText(this.value), originalEvent }
        if (!this.request('cb-before-edit', detail)) return false
        this.draft = scalarText(this.value)
        this.editing = true
        this.syncView()
        this.emit('cb-edit-start', detail)
        return true
    }

    commitEditing(value = this.draft, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly) || !bool(this.editing)) return false
        const next = scalarText(value)
        const detail = { value: next, previousValue: scalarText(this.value), originalEvent }
        if (!this.request('cb-before-change', detail)) return false
        this.value = next
        this.draft = next
        this.editing = false
        this.validationShown = true
        this.syncView()
        this.emit('cb-change', detail)
        this.emit('cb-edit-end', { ...detail, reason: 'commit' })
        return true
    }

    cancelEditing(originalEvent?: Event): boolean {
        if (!bool(this.editing)) return false
        const detail = { value: scalarText(this.value), draft: this.draft, originalEvent }
        if (!this.request('cb-before-edit-cancel', detail)) return false
        this.draft = scalarText(this.value)
        this.editing = false
        this.syncView()
        this.emit('cb-edit-end', { ...detail, reason: 'cancel' })
        return true
    }
}
