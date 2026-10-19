import { FieldControlBase, type FieldControlProps } from '../FormControlBase.js'
import { normalizeOptions, type SelectOption } from '../model.js'
import { scalarText } from '../../core/value.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength } from '../../core/popup.js'

export interface ComboboxProps extends FieldControlProps, PopupConstraintProps {
    options?: SelectOption[]
    value?: string
    placeholder?: string
    toggleLabel?: string
    emptyLabel?: string
    open?: boolean
    autocomplete?: 'none' | 'list' | 'both'
}

export abstract class ComboboxBase<P extends ComboboxProps = ComboboxProps> extends FieldControlBase<P> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'options', 'value', 'placeholder', 'toggle-label', 'empty-label', 'open', 'autocomplete', ...popupConstraintAttributes]
    options: SelectOption[] = []
    value = ''
    placeholder = ''
    toggleLabel = ''
    emptyLabel = ''
    open = false
    autocomplete: ComboboxProps['autocomplete'] = 'list'
    popupMaxWidth: PopupLength = '360px'
    popupMaxHeight: PopupLength = '240px'
    get normalizedOptions() { return normalizeOptions(this.options) }
    protected filteredOptions() {
        const query = scalarText(this.value).trim().toLocaleLowerCase()
        return query ? this.normalizedOptions.filter(option => option.label.toLocaleLowerCase().includes(query)) : this.normalizedOptions
    }
    protected captureValue(): string { return this.value }
    protected restoreValue(value: string | File | FormData | null): void { this.value = typeof value === 'string' ? value : value instanceof FormData ? scalarText(value.get(this.name)) : '' }
    setValue(value: string, originalEvent?: Event): boolean {
        return this.handleChange(value, originalEvent)
    }
    setOpen(open: boolean, originalEvent?: Event): boolean {
        if (this.unavailable || this.readOnly || this.open === open) return false
        this.open = open; this.toggleAttribute('open', open); this.syncView(); this.emit(open ? 'open' : 'close', { open, originalEvent }); return true
    }
}
