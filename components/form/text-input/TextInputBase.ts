import { scalarText } from '../../core/value.js'
import type { StudioKind, StudioValue } from '../../studio/types.js'
import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'

export interface TextInputProps extends FieldControlProps<string> {
    placeholder?: string
}

/** Headless behavior for the Text input component. */
export abstract class TextInputBase extends FieldControlBase<TextInputProps> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'placeholder']
    value = ''
    placeholder = ''
    readonly componentName = 'text-input'
    readonly componentKind: StudioKind = 'text'
    protected fieldElement(): HTMLInputElement | undefined { return this.refs.control?.[0] instanceof HTMLInputElement ? this.refs.control[0] : undefined }
    protected captureValue(): string { return this.value }
    protected restoreValue(value: string | FormRestoreValue): void {
        this.value = value instanceof FormData ? scalarText(value.get(this.name)) : value instanceof File ? value.name : scalarText(value)
    }
    setValue(value: string, originalEvent?: Event): boolean { return this.handleChange(value, originalEvent) }
    setControlValue(value: StudioValue, originalEvent?: Event): boolean { return this.setValue(scalarText(value), originalEvent) }
}
