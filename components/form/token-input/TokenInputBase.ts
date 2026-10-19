import { scalarText } from '../../core/value.js'
import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'
import type { StudioItem, StudioKind, StudioValue } from '../../studio/types.js'

export interface TokenInputProps extends FieldControlProps<StudioValue> {
    value?: StudioValue
    items?: readonly StudioItem[]
    emptyLabel?: string
    readOnly?: boolean
}

/** Headless behavior for the Token input component. */
export abstract class TokenInputBase extends FieldControlBase<TokenInputProps, StudioValue> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'value', 'items', 'empty-label']
    value: StudioValue = ''
    items: readonly StudioItem[] = []
    emptyLabel = ''
    readonly componentName = 'token-input'
    readonly componentKind: StudioKind = 'tokens'
    protected fieldElement(): undefined { return undefined }
    protected captureValue(): StudioValue { return Array.isArray(this.value) ? [...this.value] : this.value }
    protected restoreValue(value: StudioValue | FormRestoreValue): void {
        if (value instanceof FormData) {
            this.value = value.getAll(this.name).filter((item): item is string => typeof item === 'string')
        } else this.value = value instanceof File ? value.name : value
    }
    protected syncFormValue(): void {
        const values = Array.isArray(this.value) ? this.value : scalarText(this.value) ? [scalarText(this.value)] : []
        const data = new FormData()
        if (this.name) for (const value of values) data.append(this.name, value)
        this.syncForm(data)
        const message = scalarText(this.errorText) || (this.required && values.length === 0 ? 'Please select at least one value.' : '')
        this.internals?.setValidity(message ? { customError: true } : {}, message)
    }
}
