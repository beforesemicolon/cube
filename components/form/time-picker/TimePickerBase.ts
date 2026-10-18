import { FormFieldBase, type FormFieldProps } from '../FormFieldBase.js'
import { bool, finite, scalarText } from '../../core/value.js'
export interface TimePickerProps extends FormFieldProps { value?: string; min?: string; max?: string; step?: number; placeholder?: string; native?: boolean; open?: boolean }
export abstract class TimePickerBase<P extends TimePickerProps = TimePickerProps> extends FormFieldBase<P> {
    static observedAttributes = [...FormFieldBase.observedAttributes, 'value', 'min', 'max', 'step', 'placeholder', 'native', 'open']
    value = ''; min = ''; max = ''; step = 1800; placeholder = ''; native = false; open = false
    protected captureValue(): string { return this.value }
    protected restoreValue(value: string | File | FormData | null): void { this.value = typeof value === 'string' ? value : value instanceof FormData ? scalarText(value.get(this.name)) : '' }
    protected interval(): number { return Math.max(60, Math.trunc(finite(this.step, 1800))) }
    setValue(value: string, originalEvent?: Event): boolean { if (this.unavailable || bool(this.readOnly) || Boolean(value && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))) return false; if (!this.request('cb-before-change', { value, originalEvent })) return false; this.value = value; this.syncView(); this.emit('cb-change', { value, originalEvent }); this.setOpen(false, originalEvent); return true }
    setOpen(open: boolean, originalEvent?: Event): void { if (this.unavailable || bool(this.readOnly) || bool(this.native) || bool(this.open) === open) return; if (!this.request(open ? 'cb-before-open' : 'cb-before-close', { open, originalEvent })) return; this.open = open; this.toggleAttribute('open', open); this.syncView(); this.emit(open ? 'cb-open' : 'cb-close', { open, originalEvent }) }
}
