import { scalarText } from '../../core/value.js'
import type { ControlSize } from '../../core/Component.js'
import { FieldControlBase, type FieldControlProps } from '../FormControlBase.js'
import { normalizeOptions, type SelectOption, type NormalizedSelectOption } from '../model.js'

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
    size: ControlSize = 'xs'

    get normalizedOptions(): readonly NormalizedSelectOption[] { return normalizeOptions(this.props.options?.()) }
    get selection(): string {
        const value = scalarText(this.props.value?.())
        return this.normalizedOptions.some(option => option.value === value) ? value : ''
    }

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
