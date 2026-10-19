import type { StudioValue } from '../studio/types.js'
import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from './FormControlBase.js'

export type NumericInputValue = number | null

export interface NumericInputProps extends FieldControlProps<NumericInputValue> {
    min?: number
    max?: number
    step?: number
}

/** Numeric bounds shared by number, unit, range, and stepper controls. */
export abstract class NumericInputBase<P extends NumericInputProps = NumericInputProps> extends FieldControlBase<P, NumericInputValue> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'min', 'max', 'step']
    value: NumericInputValue = null
    min = 0
    max = 100
    step = 1
    protected fieldElement(): HTMLInputElement | undefined { return this.refs.control?.[0] instanceof HTMLInputElement ? this.refs.control[0] : undefined }
    protected captureValue(): NumericInputValue { return this.value }
    protected restoreValue(value: NumericInputValue | FormRestoreValue): void { this.value = this.numericValue(value) }
    setValue(value: NumericInputValue, originalEvent?: Event): boolean { return this.handleChange(this.numericValue(value), originalEvent) }
    setControlValue(value: StudioValue, originalEvent?: Event): boolean { return this.setValue(this.numericValue(value), originalEvent) }
    private numericValue(value: StudioValue | File | FormData): NumericInputValue {
        if (value instanceof FormData) return this.numericValue(value.get(this.name))
        if (typeof value === 'number') return Number.isFinite(value) ? value : null
        if (typeof value === 'string') {
            if (!value.trim()) return null
            const number = Number(value)
            return Number.isFinite(number) ? number : null
        }
        return null
    }
}
