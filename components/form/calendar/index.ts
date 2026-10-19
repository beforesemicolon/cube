import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { actionLabel, createBareButton, createIconButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
import { CalendarBase } from './CalendarBase.js';
const calendarCSS = editorCSS + `
:host{display:block;inline-size:var(--component-calendar-width,288px);max-inline-size:100%;min-inline-size:min(100%,var(--component-calendar-min-width,240px))}
[part~=calendar]{display:grid;gap:var(--spacing-sm,8px);padding:var(--spacing-md,12px);border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);box-shadow:var(--shadow-md,0 12px 32px rgba(0,0,0,.14))}
[part~=header]{display:grid;grid-template-columns:var(--component-control-height-sm,28px) 1fr var(--component-control-height-sm,28px);align-items:center;gap:4px}
[part~=month]{text-align:center;font-weight:650}
[part~=weekdays],[part~=days]{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}
[part~=weekday]{display:grid;place-items:center;min-block-size:28px;color:var(--color-muted-foreground);font-size:11px}
[part~=day]{aspect-ratio:1;min-block-size:34px;padding:0;border-color:transparent;background:transparent}
[part~=day][data-outside]{color:var(--color-muted-foreground)}
[part~=day][aria-pressed=true]{background:var(--color-primary);color:var(--color-primary-foreground)}
[part~=day][data-today]:not([aria-pressed=true]){border-color:var(--color-primary);color:var(--color-primary)}
`;
export class Calendar extends CalendarBase {
    private calendarNode?: HTMLElement;
    private monthNode?: HTMLElement;
    private weekdaysNode?: HTMLElement;
    private daysNode?: HTMLElement;
    private previousButton?: Button;
    private nextButton?: Button;
    render(): Template {
        const root = element('div', { attributes: { part: 'calendar' } }) as HTMLDivElement;
        this.calendarNode = root;
        root.setAttribute('role', 'group');
        const header = element('div', { attributes: { part: 'header' } }) as HTMLDivElement;
        this.previousButton = createIconButton('previous', 'left', () => this.moveMonth(-1));
        this.monthNode = element('div', { attributes: { part: 'month' } }) as HTMLDivElement;
        this.monthNode.setAttribute('aria-live', 'polite');
        this.nextButton = createIconButton('next', 'right', () => this.moveMonth(1));
        header.append(this.previousButton, this.monthNode, this.nextButton);
        this.weekdaysNode = element('div', { attributes: { part: 'weekdays' } }) as HTMLDivElement;
        this.daysNode = element('div', { attributes: { part: 'days' } }) as HTMLDivElement;
        this.daysNode.setAttribute('role', 'group');
        root.append(header, this.weekdaysNode, this.daysNode);
        return html`<style part="styles">${calendarCSS}</style>${root}`;
    }
    protected syncView(): void {
        if (!this.calendarNode || !this.monthNode || !this.weekdaysNode || !this.daysNode || !this.previousButton || !this.nextButton)
            return;
        const locale = this.documentLanguage();
        this.calendarNode.setAttribute('aria-label', this.accessibleName());
        actionLabel(this.previousButton, this.previousLabel);
        actionLabel(this.nextButton, this.nextLabel);
        this.previousButton.disabled = this.unavailable;
        this.nextButton.disabled = this.unavailable;
        this.monthNode.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(this.visibleMonth);
        this.weekdaysNode.replaceChildren();
        const weekStart = this.weekStart();
        for (let index = 0; index < 7; index += 1) {
            const date = new Date(2024, 0, 7 + ((weekStart + index) % 7));
            this.weekdaysNode.append(element('span', { attributes: { part: 'weekday' }, textContent: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date) }) as HTMLSpanElement);
        }
        this.daysNode.replaceChildren();
        const first = new Date(this.visibleMonth.getFullYear(), this.visibleMonth.getMonth(), 1);
        const offset = (first.getDay() - weekStart + 7) % 7;
        const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
        const selected = this.selectedDate();
        const selectedValue = selected ? this.dateValue(selected) : '';
        const todayValue = this.dateValue(new Date());
        for (let index = 0; index < 42; index += 1) {
            const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
            const value = this.dateValue(date);
            const day = createBareButton('day', event => this.chooseDate(date, event));
            actionLabel(day, String(date.getDate()));
            day.dataset.value = value;
            day.disabled = this.isUnavailable(date);
            day.toggleAttribute('data-outside', date.getMonth() !== this.visibleMonth.getMonth());
            day.toggleAttribute('data-today', value === todayValue);
            aria(day, 'aria-pressed', value === selectedValue);
            this.setDayTabIndex(day, value === selectedValue ? 0 : -1);
            day.accessibleLabel = new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date);
            day.addEventListener('keydown', event => this.handleDayKey(event, date));
            this.daysNode.append(day);
        }
        const hasFocusableDay = [...this.daysNode.querySelectorAll<Button>('cb-button')]
            .some(day => day.shadowRoot?.querySelector<HTMLElement>('[part~=control]')?.tabIndex === 0);
        if (!hasFocusableDay) {
            const today = this.daysNode.querySelector<Button>(`cb-button[data-value="${todayValue}"]`);
            const first = this.daysNode.querySelector<Button>('cb-button:not([data-outside]):not([disabled])');
            const focusTarget = today ?? first;
            if (focusTarget)
                this.setDayTabIndex(focusTarget, 0);
        }
    }
    private handleDayKey(event: KeyboardEvent, date: Date): void {
        const weekdayIndex = (date.getDay() - this.weekStart() + 7) % 7;
        const offsets: Readonly<Record<string, number>> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekdayIndex, End: 6 - weekdayIndex };
        const offset = offsets[event.key];
        if (offset === undefined)
            return;
        event.preventDefault();
        const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
        if (next.getMonth() !== this.visibleMonth.getMonth())
            this.visibleMonth = new Date(next.getFullYear(), next.getMonth(), 1);
        this.syncView();
        this.daysNode?.querySelector<Button>(`cb-button[data-value="${this.dateValue(next)}"]`)?.focus();
    }
    private setDayTabIndex(day: Button, value: number): void {
        const control = day.shadowRoot?.querySelector<HTMLElement>('[part~=control]');
        if (control)
            control.tabIndex = value;
    }
}
export { CalendarBase };
export type { CalendarProps } from './CalendarBase.js';
