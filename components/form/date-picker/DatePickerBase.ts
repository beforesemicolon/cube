import { FormFieldBase, type FormFieldProps } from '../FormFieldBase.js'
import { bool, scalarText } from '../../core/value.js'

export interface DatePickerProps extends FormFieldProps { value?: string; min?: string; max?: string; placeholder?: string; previousLabel?: string; nextLabel?: string; native?: boolean; open?: boolean }
function validDate(value: string): boolean {
    if (!value) return true
    const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/.exec(value)
    if (!match?.groups) return false
    const year = Number(match.groups.year), month = Number(match.groups.month), day = Number(match.groups.day)
    const date = new Date(0); date.setFullYear(year, month - 1, day); date.setHours(12, 0, 0, 0)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}
export abstract class DatePickerBase<P extends DatePickerProps = DatePickerProps> extends FormFieldBase<P> {
    static observedAttributes = [...FormFieldBase.observedAttributes, 'value', 'min', 'max', 'placeholder', 'previous-label', 'next-label', 'native', 'open']
    value = ''; min = ''; max = ''; placeholder = ''; previousLabel = ''; nextLabel = ''; native = false; open = false
    protected captureValue(): string { return this.value }
    protected restoreValue(value: string | File | FormData | null): void { this.value = typeof value === 'string' ? value : value instanceof FormData ? scalarText(value.get(this.name)) : '' }
    setValue(value: string, originalEvent?: Event): boolean { if (this.unavailable || bool(this.readOnly) || !validDate(value)) return false; if (!this.request('cb-before-change', { value, originalEvent })) return false; this.value = value; this.syncView(); this.emit('cb-change', { value, originalEvent }); this.setOpen(false, originalEvent); return true }
    setOpen(open: boolean, originalEvent?: Event): void { if (this.unavailable || bool(this.readOnly) || bool(this.native) || bool(this.open) === open) return; if (!this.request(open ? 'cb-before-open' : 'cb-before-close', { open, originalEvent })) return; this.open = open; this.toggleAttribute('open', open); this.syncView(); this.emit(open ? 'cb-open' : 'cb-close', { open, originalEvent }) }
}
