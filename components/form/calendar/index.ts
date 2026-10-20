import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import { when, is, html, repeat, type Template } from '../../core/runtime.js'

import { CalendarBase } from './CalendarBase.js'

export class Calendar extends CalendarBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`
            <div part="calendar" role="group" aria-label="${this.accessibleName}">
                <div part="header">
                    <cb-button part="previous" exportparts="control:previous-control,label:previous-label,button-label:previous-label,icon:previous-icon,description:previous-description" variant="ghost" icon="left" icon-only="true"
                        accessible-label="${this.props.previousLabel}" disabled="${() => this.unavailable}"
                        onaction="${(event: Event) => { event.stopPropagation(); this.moveMonth(-1); }}"></cb-button>
                    <div part="month" aria-live="polite">${this.monthLabel}</div>
                    <cb-button part="next" exportparts="control:next-control,label:next-label,button-label:next-label,icon:next-icon,description:next-description" variant="ghost" icon="right" icon-only="true"
                        accessible-label="${this.props.nextLabel}" disabled="${() => this.unavailable}"
                        onaction="${(event: Event) => { event.stopPropagation(); this.moveMonth(1); }}"></cb-button>
                </div>
                <div part="weekdays">${repeat([0, 1, 2, 3, 4, 5, 6], index => html`<span part="weekday">${() => new Intl.DateTimeFormat(this.documentLanguage(), { weekday: 'short' }).format(new Date(2024, 0, 7 + ((this.weekStart() + index) % 7)))}</span>`)}</div>
                <div ref="days" part="days" role="group">${repeat(this.visibleDates, date => {
                    const value = this.dateValue(date)
                    return html`<cb-button ref="dates" part="day" exportparts="control:day-control,label:day-label,button-label:day-label,icon:day-icon,description:day-description" data-bare data-semantic-host
                        data-value="${value}" label="${date.getDate()}"
                        accessible-label="${() => new Intl.DateTimeFormat(this.documentLanguage(), { dateStyle: 'full' }).format(date)}"
                        disabled="${() => this.isUnavailable(date)}"
                        data-outside="${() => date.getMonth() !== this.visibleMonth.getMonth() ? '' : null}"
                        data-today="${value === this.dateValue(new Date()) ? '' : null}"
                        aria-pressed="${when(is(() => value === this.value), 'true', 'false')}"
                        tabindex="${() => value === this.focusableDate() ? 0 : -1}"
                        onaction="${(event: Event) => { event.stopPropagation(); this.chooseDate(date, event); }}"
                        onkeydown="${(event: KeyboardEvent) => this.handleDayKey(event, date)}"></cb-button>`
                }, { key: this.dateValue })}</div>
            </div>`
    }
    private monthLabel = (): string => new Intl.DateTimeFormat(this.documentLanguage(), { month: 'long', year: 'numeric' }).format(this.visibleMonth)
    private visibleDates = (): Date[] => {
        const first = new Date(this.visibleMonth.getFullYear(), this.visibleMonth.getMonth(), 1)
        const offset = (first.getDay() - this.weekStart() + 7) % 7
        return Array.from({ length: 42 }, (_, index) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + index))
    }
    private focusableDate(): string {
        const dates = this.visibleDates().filter(date => !this.isUnavailable(date))
        const today = this.dateValue(new Date())
        return dates.some(date => this.dateValue(date) === this.value) ? this.value
            : dates.some(date => this.dateValue(date) === today) ? today
            : this.dateValue(dates.find(date => date.getMonth() === this.visibleMonth.getMonth()) ?? this.visibleMonth)
    }
    private handleDayKey(event: KeyboardEvent, date: Date): void {
        const weekdayIndex = (date.getDay() - this.weekStart() + 7) % 7
        const offsets: Readonly<Record<string, number>> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekdayIndex, End: 6 - weekdayIndex }
        const offset = offsets[event.key]
        if (offset === undefined) return
        event.preventDefault()
        const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset)
        if (next.getMonth() !== this.visibleMonth.getMonth()) this.visibleMonth = new Date(next.getFullYear(), next.getMonth(), 1)
        queueMicrotask(() => elementRefs(this.refs.dates).find(node => node.dataset.value === this.dateValue(next))?.focus())
    }
}
export { CalendarBase };
export type { CalendarProps } from './CalendarBase.js';
