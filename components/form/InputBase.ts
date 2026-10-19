import { scalarText } from '../core/value.js'
import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from './FormControlBase.js'
import type { StudioValue } from '../studio/types.js'

export interface InputProps extends FieldControlProps<StudioValue> {
    value?: StudioValue
    placeholder?: string
    readOnly?: boolean
}

/** Value and editing behavior shared by primitive input controls. */
export abstract class InputBase<P extends InputProps = InputProps> extends FieldControlBase<P, StudioValue> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'value', 'placeholder']
    value: StudioValue = ''
    placeholder = ''
    protected fieldElement(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | undefined {
        return this.contentRoot.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input[part~="control"],select[part~="control"],textarea[part~="control"]') ?? undefined
    }
    protected captureValue(): StudioValue { return Array.isArray(this.value) ? [...this.value] : this.value }
    protected restoreValue(value: StudioValue | FormRestoreValue): void {
        if (value instanceof FormData) {
            const values = value.getAll(this.name).filter((item): item is string => typeof item === 'string')
            this.value = values.length > 1 ? values : values[0] ?? ''
            return
        }
        this.value = value instanceof File ? value.name : value
    }
    protected syncFormValue(): void {
        if (Array.isArray(this.value)) {
            const data = new FormData()
            if (this.name) for (const value of this.value) data.append(this.name, value)
            this.syncForm(data)
            return
        }
        this.syncForm(this.value === null ? '' : scalarText(this.value))
    }
}
