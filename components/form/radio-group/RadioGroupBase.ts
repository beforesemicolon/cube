import { bool, scalarText } from '../../core/value.js'
import { FieldControlBase, type FieldControlProps } from '../FormControlBase.js'
import { normalizeOptions, type SelectOption } from '../model.js'

export interface RadioGroupProps extends FieldControlProps {
    options?: SelectOption[]
    value?: string
    stacked?: boolean
}

/** Headless single-selection behavior shared by radio-group renderers. */
export abstract class RadioGroupBase extends FieldControlBase<RadioGroupProps> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'options', 'value', 'stacked']
    options: SelectOption[] = []
    value = ''
    stacked = false

    get normalizedOptions(): ReadonlyArray<Required<SelectOption>> { return normalizeOptions(this.options) }
    get selection(): string { return this.normalizedOptions.some(option => option.value === scalarText(this.value)) ? scalarText(this.value) : '' }

    protected captureValue(): string { return this.value }
    protected restoreValue(value: string | File | FormData | null): void {
        this.value = value instanceof FormData ? scalarText(value.get(this.name)) : typeof value === 'string' ? value : ''
    }
    protected syncFormValue():void{this.syncForm(this.selection)}

    choose(value: string, originalEvent?: Event): boolean {
        const option = this.normalizedOptions.find(candidate => candidate.value === value)
        if (!option || option.disabled) { this.syncView(); return false }
        return this.handleChange(option.value,originalEvent)
    }
}
