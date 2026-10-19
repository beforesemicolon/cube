import { Component, type ComponentProps } from '../../core/Component.js'
import { finite, scalarText } from '../../core/value.js'

export interface CalendarProps extends ComponentProps {
    value?: string
    min?: string
    max?: string
    firstDayOfWeek?: number
    previousLabel?: string
    nextLabel?: string
}

function validDate(value: string): Date | undefined {
    const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/.exec(value)
    if (!match?.groups) return undefined
    const year = Number(match.groups.year)
    const month = Number(match.groups.month)
    const day = Number(match.groups.day)
    const date = new Date(0)
    date.setFullYear(year, month - 1, day)
    date.setHours(12, 0, 0, 0)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined
}

export abstract class CalendarBase<P extends CalendarProps = CalendarProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'value', 'min', 'max', 'first-day-of-week', 'previous-label', 'next-label']
    value = ''
    min = ''
    max = ''
    firstDayOfWeek = 0
    previousLabel = ''
    nextLabel = ''
    visibleMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    protected mount(): void { this.syncMonth(); super.mount() }
    protected update(name: string): void { if (name === 'value') this.syncMonth(); super.update(name) }

    protected selectedDate(): Date | undefined { return validDate(scalarText(this.value)) }
    protected minimumDate(): Date | undefined { return validDate(scalarText(this.min)) }
    protected maximumDate(): Date | undefined { return validDate(scalarText(this.max)) }
    protected weekStart(): number { return Math.min(6, Math.max(0, Math.trunc(finite(this.firstDayOfWeek)))) }
    protected dateValue(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    protected isUnavailable(date: Date): boolean {
        const value = this.dateValue(date)
        const minimum = this.minimumDate()
        const maximum = this.maximumDate()
        return this.unavailable
            || Boolean(minimum && value < this.dateValue(minimum))
            || Boolean(maximum && value > this.dateValue(maximum))
    }
    protected chooseDate(date: Date, originalEvent?: Event): boolean {
        if (this.isUnavailable(date)) return false
        const value = this.dateValue(date)
        if (!this.request('cb-before-change', { value, date, originalEvent })) return false
        this.value = value
        this.visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        this.syncView()
        this.emit('cb-change', { value, date, originalEvent })
        return true
    }
    protected moveMonth(amount: number): void {
        this.visibleMonth = new Date(this.visibleMonth.getFullYear(), this.visibleMonth.getMonth() + amount, 1)
        this.syncView()
    }
    protected syncMonth(): void {
        const selected = this.selectedDate()
        if (selected) this.visibleMonth = new Date(selected.getFullYear(), selected.getMonth(), 1)
    }
}
