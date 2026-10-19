import { bool, scalarText } from '../../core/value.js'
import { FormControlBase, type FormControlProps } from '../FormControlBase.js'
import { normalizeOptions, type SelectOption } from '../model.js'

export interface RadioGroupProps extends FormControlProps {
    options?: SelectOption[]
    value?: string
    orientation?: 'horizontal' | 'vertical'
}

/** Headless single-selection behavior shared by radio-group renderers. */
export abstract class RadioGroupBase extends FormControlBase<RadioGroupProps> {
    static observedAttributes = [...FormControlBase.observedAttributes, 'options', 'value', 'orientation']
    options: SelectOption[] = []
    value = ''
    orientation: 'horizontal' | 'vertical' = 'vertical'

    get normalizedOptions(): ReadonlyArray<Required<SelectOption>> { return normalizeOptions(this.options) }
    get selection(): string { return this.normalizedOptions.some(option => option.value === scalarText(this.value)) ? scalarText(this.value) : '' }

    protected captureValue(): string { return this.value }
    protected restoreValue(value: string | File | FormData | null): void {
        this.value = value instanceof FormData ? scalarText(value.get(this.name)) : typeof value === 'string' ? value : ''
    }

    choose(value: string, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) { this.syncView(); return false }
        const option = this.normalizedOptions.find(candidate => candidate.value === value)
        if (!option || option.disabled) { this.syncView(); return false }
        const detail = { value: option.value, originalEvent }
        if (!this.request('cb-before-change', detail)) { this.syncView(); return false }
        this.value = option.value
        this.syncView()
        this.emit('cb-change', detail)
        return true
    }
}
