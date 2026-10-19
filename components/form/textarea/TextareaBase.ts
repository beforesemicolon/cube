import { scalarText } from '../../core/value.js'
import type { StudioKind, StudioValue } from '../../studio/types.js'
import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'

export interface TextareaProps extends FieldControlProps<string> {
    placeholder?: string
}

/** Headless behavior for the Textarea component. */
export abstract class TextareaBase extends FieldControlBase<TextareaProps> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'placeholder']
    value = ''
    placeholder = ''
    readonly componentName = 'textarea'
    readonly componentKind: StudioKind = 'textarea'
    protected fieldElement(): HTMLTextAreaElement | undefined { return this.contentRoot.querySelector<HTMLTextAreaElement>('textarea[part~="control"]') ?? undefined }
    protected captureValue(): string { return this.value }
    protected restoreValue(value: string | FormRestoreValue): void {
        this.value = value instanceof FormData ? scalarText(value.get(this.name)) : value instanceof File ? value.name : scalarText(value)
    }
    setValue(value: string, originalEvent?: Event): boolean { return this.handleChange(value, originalEvent) }
    setControlValue(value: StudioValue, originalEvent?: Event): boolean { return this.setValue(scalarText(value), originalEvent) }
}
