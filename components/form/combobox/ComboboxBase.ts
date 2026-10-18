import { FormFieldBase, type FormFieldProps } from '../FormFieldBase.js'
import { normalizeOptions, type SelectOption } from '../model.js'
import { scalarText } from '../../core/value.js'

export interface ComboboxProps extends FormFieldProps {
    options?: SelectOption[]
    value?: string
    placeholder?: string
    toggleLabel?: string
    emptyLabel?: string
    open?: boolean
    autocomplete?: 'none' | 'list' | 'both'
}

export abstract class ComboboxBase<P extends ComboboxProps = ComboboxProps> extends FormFieldBase<P> {
    static observedAttributes = [...FormFieldBase.observedAttributes, 'options', 'value', 'placeholder', 'toggle-label', 'empty-label', 'open', 'autocomplete']
    options: SelectOption[] = []
    value = ''
    placeholder = ''
    toggleLabel = ''
    emptyLabel = ''
    open = false
    autocomplete: ComboboxProps['autocomplete'] = 'list'
    get normalizedOptions() { return normalizeOptions(this.options) }
    protected filteredOptions() {
        const query = scalarText(this.value).trim().toLocaleLowerCase()
        return query ? this.normalizedOptions.filter(option => option.label.toLocaleLowerCase().includes(query)) : this.normalizedOptions
    }
    protected captureValue(): string { return this.value }
    protected restoreValue(value: string | File | FormData | null): void { this.value = typeof value === 'string' ? value : value instanceof FormData ? scalarText(value.get(this.name)) : '' }
    setValue(value: string, originalEvent?: Event): boolean {
        if (this.unavailable || this.readOnly) return false
        if (!this.request('cb-before-change', { value, originalEvent })) return false
        this.value = value; this.syncView(); this.emit('cb-change', { value, originalEvent }); return true
    }
    setOpen(open: boolean, originalEvent?: Event): boolean {
        if (this.unavailable || this.readOnly || this.open === open) return false
        this.open = open; this.toggleAttribute('open', open); this.syncView(); this.emit(open ? 'cb-open' : 'cb-close', { open, originalEvent }); return true
    }
}
