import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { uid } from '../../core/id.js'
import { createIcon } from '../../icons/paths.js';
import { bool, text } from '../../core/value.js';
import { PopupController } from '../../core/popup.js';
import { DatePickerBase } from './DatePickerBase.js';
import type { Calendar } from '../calendar/index.js';
import { createBareButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
const css = editorCSS + `:host{display:inline-block;inline-size:var(--component-date-picker-width,240px)}[part~=root]{position:relative;display:grid}[part~=trigger]{display:block;inline-size:100%;padding:0;text-align:start}[part~=trigger]::part(trigger-control),[part~=trigger]::part(trigger-label){display:flex;align-items:center;justify-content:space-between;inline-size:100%;text-align:inherit}[part~=trigger]::part(trigger-control){padding:var(--spacing-xs,4px) var(--spacing-md,12px)}[part~=popup]{z-index:var(--z-index-dropdown,1000);inline-size:max-content;box-sizing:border-box;overflow:auto;padding:0;border:0;background:transparent;color:var(--color-foreground)}[part~=native]{inline-size:100%;color-scheme:inherit}`;
export class DatePicker extends DatePickerBase {
    private nativeControl?: HTMLInputElement;
    private trigger?: Button;
    private valueNode?: HTMLElement;
    private popup?: HTMLElement;
    private popupController?: PopupController;
    private calendar?: Calendar;
    render(): Template {
        const root = element('div', { attributes: { part: 'root' } }) as HTMLDivElement;
        this.trigger = createBareButton('trigger control', event => this.setOpen(!this.open, event));
        this.trigger.id = uid('cb-date-picker');
        this.valueNode = element('span', { attributes: { part: 'value' } }) as HTMLSpanElement;
        this.trigger.append(this.valueNode, createIcon('calendar', 'icon'));
        this.popup = element('div', { attributes: { part: 'popup' } }) as HTMLDivElement;
        this.popup.id = `${this.trigger.id}-popup`;
        this.popup.setAttribute('role', 'dialog');
        this.calendar = document.createElement('cb-calendar') as Calendar;
        this.popup.append(this.calendar);
        this.nativeControl = element('input', { attributes: { part: 'native control' } }) as HTMLInputElement;
        this.nativeControl.type = 'date';
        this.nativeControl.id = `${this.trigger.id}-native`;
        root.addEventListener('keydown', event => { if (event.key === 'Escape') {
            this.setOpen(false, event);
            this.trigger?.focus();
        } });
        this.calendar.addEventListener('change', event => { const detail = (event as CustomEvent<{
            value: string;
        }>).detail; this.setValue(detail.value, event); this.trigger?.focus(); });
        this.nativeControl.addEventListener('input', event => this.setValue(this.nativeControl!.value, event));
        this.nativeControl.addEventListener('blur', () => { this.validationShown = true; this.syncView(); });
        root.append(this.trigger, this.popup, this.nativeControl);
        return html`<style part="styles">${css}</style>${root}`;
    }
    protected mount(): void {
        if (this.popup && this.trigger) {
            this.popupController = new PopupController(this.popup, this.trigger, () => this.setOpen(false), {
                placement: () => 'bottom-start',
                maxWidth: () => this.popupMaxWidth,
                maxHeight: () => this.popupMaxHeight,
            });
            this.cleanup(() => this.popupController?.dispose());
        }
        super.mount();
        this.syncPopup();
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.nativeControl; }
    protected syncView(): void {
        if (!this.nativeControl || !this.trigger || !this.valueNode || !this.popup || !this.calendar)
            return;
        const native = bool(this.native);
        this.nativeControl.hidden = !native;
        this.trigger.hidden = native;
        this.nativeControl.value = this.value;
        this.nativeControl.min = this.min;
        this.nativeControl.max = this.max;
        this.nativeControl.disabled = this.unavailable;
        this.nativeControl.readOnly = bool(this.readOnly);
        this.nativeControl.required = bool(this.required);
        Object.assign(this.calendar, { value: this.value, min: this.min, max: this.max, previousLabel: this.previousLabel, nextLabel: this.nextLabel, disabled: this.unavailable || bool(this.readOnly), accessibleLabel: this.accessibleName() });
        const selected = this.value ? new Date(`${this.value}T12:00:00`) : undefined;
        this.valueNode.textContent = selected && !Number.isNaN(selected.valueOf()) ? new Intl.DateTimeFormat(this.documentLanguage(), { dateStyle: 'medium' }).format(selected) : text(this.placeholder);
        const accessibleName = this.accessibleName(), visibleValue = this.valueNode.textContent ?? '';
        this.trigger.accessibleLabel = accessibleName && visibleValue ? `${accessibleName}: ${visibleValue}` : accessibleName || visibleValue;
        this.nativeControl.setAttribute('aria-label', accessibleName);
        this.popup.setAttribute('aria-label', accessibleName);
        this.trigger.disabled = this.unavailable || bool(this.readOnly);
        this.trigger.setAttribute('aria-haspopup', 'dialog');
        this.trigger.setAttribute('aria-controls', this.popup.id);
        aria(this.trigger, 'aria-expanded', this.open);
        this.syncForm(this.value);
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText)));
        const description = [text(this.description), error ? this.validationMessage : ''].filter(Boolean).join(' ') || null;
        aria(this.trigger, 'aria-invalid', error ? true : null);
        aria(this.nativeControl, 'aria-invalid', error ? true : null);
        aria(this.trigger, 'aria-description', description);
        aria(this.nativeControl, 'aria-description', description);
        this.toggleAttribute('data-invalid', error);
        this.syncPopup();
    }
    private syncPopup(): void {
        if (!this.popup)
            return;
        if (bool(this.native) || !bool(this.open))
            this.popupController?.hide();
        else
            this.popupController?.show();
        if (!this.popupController)
            this.popup.hidden = bool(this.native) || !bool(this.open);
    }
    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options); }
}
export { DatePickerBase };
export type { DatePickerProps } from './DatePickerBase.js';
