import { FieldControlBase, type FieldControlProps } from '../FormControlBase.js'
import { normalizeOptions, type SelectOption } from '../model.js'
import { bool, scalarText, text } from '../../core/value.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength } from '../../core/popup.js'
import { state } from '../../core/runtime.js'

export interface ComboboxProps extends FieldControlProps<string | string[]>, PopupConstraintProps {
    options?: SelectOption[]
    value?: string | string[]
    multi?: boolean
    allowCustom?: boolean
    removeLabel?: string
    placeholder?: string
    toggleLabel?: string
    emptyLabel?: string
    open?: boolean
    autocomplete?: 'none' | 'list' | 'both'
}

export abstract class ComboboxBase<P extends ComboboxProps = ComboboxProps> extends FieldControlBase<P, string | string[]> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'options', 'value', 'multi', 'allow-custom', 'remove-label', 'placeholder', 'toggle-label', 'empty-label', 'open', 'autocomplete', ...popupConstraintAttributes]
    options: SelectOption[] = []
    value: string | string[] = ''
    multi = false
    allowCustom = false
    removeLabel = ''
    placeholder = ''
    toggleLabel = ''
    emptyLabel = ''
    open = false
    autocomplete: ComboboxProps['autocomplete'] = 'list'
    popupMaxWidth: PopupLength = '360px'
    popupMaxHeight: PopupLength = '240px'
    private readonly optionRevision = state(0)
    protected readonly query = state('')
    protected mount(): void {
        this.value = this.normalizeValue(this.value)
        super.mount()
    }
    protected update(name: string): void {
        if (name === 'multi') {
            this.query[1]('')
            this.value = this.normalizeValue(this.value)
        }
        super.update(name)
        if (name === 'options') queueMicrotask(() => {
            // Options can change from a consumer's input handler while the
            // current query is still committing. Re-filter after that commit.
            if (this.isConnected) this.optionRevision[1](this.optionRevision[0]() + 1)
        })
    }
    get normalizedOptions() { return normalizeOptions(this.props.options?.()) }
    get selection(): string[] {
        const values = Array.isArray(this.value) ? this.value : [this.value]
        return [...new Set(values.map(value => scalarText(value)).filter(Boolean))]
    }
    protected singleValue = (): string => { return Array.isArray(this.value) ? scalarText(this.value[0]) : scalarText(this.value) }
    protected queryValue = (): string => { return bool(this.multi) ? this.query[0]() : this.singleValue() }
    protected filteredOptions = () => {
        this.optionRevision[0]()
        const query = this.queryValue().trim().toLocaleLowerCase()
        return query ? this.normalizedOptions.filter(option => option.label.toLocaleLowerCase().includes(query)) : this.normalizedOptions
    }
    protected normalizeValue(value: string | string[]): string | string[] {
        const values = Array.isArray(value) ? value : value ? [value] : []
        return bool(this.multi) ? [...new Set(values.map(item => scalarText(item)).filter(Boolean))] : scalarText(values[0])
    }
    protected captureValue(): string | string[] { return bool(this.multi) ? this.selection : this.singleValue() }
    protected restoreValue(value: string | string[] | File | FormData | null): void {
        const values = value instanceof FormData ? value.getAll(this.name).filter((item): item is string => typeof item === 'string') : value instanceof File || value === null ? '' : value
        this.query[1]('')
        this.value = this.normalizeValue(values)
    }
    protected serializedValue(): string | FormData {
        if (!bool(this.multi)) return this.singleValue()
        const data = new FormData()
        if (this.name) for (const value of this.selection) data.append(this.name, value)
        return data
    }
    protected syncFormValue(): void {
        super.syncFormValue()
        if (bool(this.multi) && bool(this.required) && !this.selection.length && !this.unavailable && !bool(this.readOnly) && !text(this.errorText)) {
            // Use the browser's localized required-field message; the draft is
            // not a selection and must not satisfy the form's required value.
            const required = this.ownerDocument.createElement('input')
            required.required = true
            this.internals?.setValidity({ valueMissing: true }, required.validationMessage, this.fieldElement())
        }
    }
    setValue(value: string | string[], originalEvent?: Event): boolean {
        return this.handleChange(value, originalEvent)
    }
    choose = (value: string, originalEvent?: Event): boolean => {
        const option = this.normalizedOptions.find(item => item.value === value)
        if (!option || option.disabled) return false
        if (!bool(this.multi)) return this.setValue(value, originalEvent)
        return this.setValue(this.selection.includes(value) ? this.selection.filter(item => item !== value) : [...this.selection, value], originalEvent)
    }
    protected acceptCustomValue = (originalEvent?: Event): boolean => {
        const value = this.queryValue().trim()
        if (!bool(this.allowCustom) || !this.canChangeValue() || !value || this.filteredOptions().length > 0) return false
        if (bool(this.multi)) {
            if (this.selection.includes(value)) return true
            return this.setValue([...this.selection, value], originalEvent)
        }
        return this.setValue(value, originalEvent) || this.singleValue() === value
    }
    removeValue = (value: string, originalEvent?: Event): boolean => {
        return bool(this.multi) && this.selection.includes(value) && this.setValue(this.selection.filter(item => item !== value), originalEvent)
    }
    setOpen(open: boolean, originalEvent?: Event): boolean {
        if (this.unavailable || this.readOnly || this.open === open) return false
        this.open = open; this.toggleAttribute('open', open); this.syncView(); this.emit(open ? 'open' : 'close', { open, originalEvent }); return true
    }
}
