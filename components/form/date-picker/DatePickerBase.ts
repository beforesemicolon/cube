import { FieldControlBase, type FieldControlProps } from '../FormControlBase.js'
import { bool, scalarText } from '../../core/value.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength } from '../../core/popup.js'

export interface DatePickerProps extends FieldControlProps, PopupConstraintProps { value?: string; min?: string; max?: string; placeholder?: string; previousLabel?: string; nextLabel?: string; native?: boolean; open?: boolean }
export interface DatePickerChangeDetail {
    readonly value: string
    readonly previousValue: string
    readonly date: Date | null
    readonly originalEvent?: Event
}
function selectedDate(value: string): Date | undefined {
    const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/.exec(value)
    if (!match?.groups) return undefined
    const year = Number(match.groups.year), month = Number(match.groups.month), day = Number(match.groups.day)
    const date = new Date(0); date.setFullYear(year, month - 1, day); date.setHours(12, 0, 0, 0)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined
}
export abstract class DatePickerBase<P extends DatePickerProps = DatePickerProps> extends FieldControlBase<P> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'value', 'min', 'max', 'placeholder', 'previous-label', 'next-label', 'native', 'open', ...popupConstraintAttributes]
    value = ''; min = ''; max = ''; placeholder = ''; previousLabel = ''; nextLabel = ''; native = false; open = false
    popupMaxWidth: PopupLength = '360px'; popupMaxHeight: PopupLength = '440px'
    protected captureValue(): string { return this.value }
    protected restoreValue(value: string | File | FormData | null): void { this.value = typeof value === 'string' ? value : value instanceof FormData ? scalarText(value.get(this.name)) : '' }
    setValue(value: string, originalEvent?: Event): boolean {
        const date = selectedDate(value)
        if (value && !date) return false
        const changed = this.handleChange(value, originalEvent, { date: date ?? null })
        if (changed) this.setOpen(false, originalEvent)
        return changed
    }
    setOpen(open: boolean, originalEvent?: Event): void { if (this.unavailable || bool(this.readOnly) || bool(this.native) || bool(this.open) === open) return; if (!this.request(open ? 'beforeopen' : 'beforeclose', { open, originalEvent })) return; this.open = open; this.toggleAttribute('open', open); this.syncView(); this.emit(open ? 'open' : 'close', { open, originalEvent }) }
}
