import { scalarText } from '../core/value.js'
import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from './FormControlBase.js'
import type { StudioValue } from '../studio/types.js'

export interface ChoiceControlProps extends FieldControlProps {
    checked?: boolean
    value?: string
}

/** Binary checked state shared by checkbox-like controls. */
export abstract class ChoiceControlBase<P extends ChoiceControlProps = ChoiceControlProps> extends FieldControlBase<P, boolean, string> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'checked', 'value']
    checked = false
    value = 'on'
    protected fieldElement(): HTMLInputElement | undefined { return this.contentRoot.querySelector<HTMLInputElement>('[part~="control"]') ?? undefined }
    protected captureValue(): boolean { return this.checked }
    protected restoreValue(value: boolean | FormRestoreValue): void {
        if (typeof value === 'boolean') this.checked = value
        else if (value instanceof FormData) this.checked = value.has(this.name)
        else this.checked = value !== null && value !== ''
    }
    setChecked(checked:boolean,originalEvent?:Event):boolean{
        return this.commitState(this.checked,checked,originalEvent,{checked},value=>this.checked=value)
    }
    setControlValue(value:StudioValue,originalEvent?:Event):boolean{return this.setChecked(value===true,originalEvent)}
    protected syncFormValue(): void { this.syncForm(this.checked ? scalarText(this.value, 'on') : null) }
}
