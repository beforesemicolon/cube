import { scalarText } from '../core/value.js'
import { FormControlBase, type FormControlProps, type FormRestoreValue } from './FormControlBase.js'

export interface ChoiceControlProps extends FormControlProps {
    checked?: boolean
    value?: string
}

/** Binary checked state shared by checkbox-like controls. */
export abstract class ChoiceControlBase<P extends ChoiceControlProps = ChoiceControlProps> extends FormControlBase<P, boolean> {
    static observedAttributes = [...FormControlBase.observedAttributes, 'checked', 'value']
    checked = false
    value = 'on'
    protected fieldElement(): HTMLInputElement | undefined { return this.contentRoot.querySelector<HTMLInputElement>('[part~="control"]') ?? undefined }
    protected captureValue(): boolean { return this.checked }
    protected restoreValue(value: boolean | FormRestoreValue): void {
        if (typeof value === 'boolean') this.checked = value
        else if (value instanceof FormData) this.checked = value.has(this.name)
        else this.checked = value !== null && value !== ''
    }
    protected syncFormValue(): void { this.syncForm(this.checked ? scalarText(this.value, 'on') : null) }
}
