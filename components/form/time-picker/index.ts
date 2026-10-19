import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { uid } from '../../core/id.js'
import { createIcon } from '../../icons/paths.js';
import { bool, text } from '../../core/value.js';
import { PopupController } from '../../core/popup.js';
import { TimePickerBase } from './TimePickerBase.js';
import { actionLabel, createBareButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
const css = editorCSS + `
:host{display:inline-block;inline-size:var(--component-time-picker-width,220px)}
[part~=root]{position:relative;display:grid}
[part~=trigger]{display:block;inline-size:100%;padding:0;text-align:start}[part~=trigger]::part(control),[part~=trigger]::part(button-label){display:flex;align-items:center;justify-content:space-between;inline-size:100%;text-align:inherit}[part~=trigger]::part(control){padding:var(--spacing-xs,4px) var(--spacing-md,12px)}
[part~=popup]{z-index:var(--z-index-dropdown,1000);inline-size:max-content;box-sizing:border-box;overflow:auto;padding:4px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);color:var(--color-foreground);box-shadow:var(--shadow-md,0 12px 32px rgba(0,0,0,.14))}
[part~=option]{display:block;inline-size:100%;min-block-size:var(--cb-height);border-color:transparent;background:transparent;text-align:start}[part~=option]::part(control){justify-content:flex-start;padding:var(--spacing-xs,4px) var(--spacing-md,12px);text-align:inherit}
[part~=option][aria-selected=true]{background:var(--color-selection);color:var(--color-signal-text)}
[part~=native]{inline-size:100%;color-scheme:inherit}
`;
export class TimePicker extends TimePickerBase {
    private nativeControl?: HTMLInputElement;
    private trigger?: Button;
    private valueNode?: HTMLElement;
    private popup?: HTMLElement;
    private popupController?: PopupController;
    render(): Template {
        const root = element('div', { attributes: { part: 'root' } }) as HTMLDivElement;
        this.trigger = createBareButton('trigger control', event => this.setOpen(!this.open, event));
        this.trigger.id = uid('cb-time-picker');
        this.valueNode = element('span', { attributes: { part: 'value' } }) as HTMLSpanElement;
        this.trigger.append(this.valueNode, createIcon('clock', 'icon'));
        this.popup = element('div', { attributes: { part: 'popup listbox' } }) as HTMLDivElement;
        this.popup.id = `${this.trigger.id}-popup`;
        this.popup.setAttribute('role', 'listbox');
        this.nativeControl = element('input', { attributes: { part: 'native control' } }) as HTMLInputElement;
        this.nativeControl.type = 'time';
        this.nativeControl.id = `${this.trigger.id}-native`;
        this.trigger.addEventListener('keydown', event => this.handleKey(event));
        this.popup.addEventListener('keydown', event => this.handleKey(event));
        this.nativeControl.addEventListener('input', event => this.setValue(this.nativeControl!.value, event));
        this.nativeControl.addEventListener('blur', () => { this.validationShown = true; this.syncView(); });
        root.append(this.trigger, this.popup, this.nativeControl);
        return html`<style part="styles">${css}</style>${root}`;
    }
    protected mount(): void {
        if (this.popup && this.trigger) {
            this.popupController = new PopupController(this.popup, this.trigger, () => this.setOpen(false), {
                placement: () => 'bottom-start',
                matchAnchorWidth: true,
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
        if (!this.nativeControl || !this.trigger || !this.valueNode || !this.popup)
            return;
        const native = bool(this.native);
        this.nativeControl.hidden = !native;
        this.trigger.hidden = native;
        this.nativeControl.value = this.value;
        this.nativeControl.min = this.min;
        this.nativeControl.max = this.max;
        this.nativeControl.step = String(this.interval());
        this.nativeControl.disabled = this.unavailable;
        this.nativeControl.readOnly = bool(this.readOnly);
        this.nativeControl.required = bool(this.required);
        this.popup.replaceChildren();
        for (let seconds = 0; seconds < 86400; seconds += this.interval()) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            if ((this.min && value < this.min) || (this.max && value > this.max))
                continue;
            const option = createBareButton('option', event => { this.setValue(value, event); this.trigger?.focus(); });
            actionLabel(option, this.formatTime(hours, minutes));
            option.setAttribute('role', 'option');
            aria(option, 'aria-selected', value === this.value);
            this.popup.append(option);
        }
        const match = /^(?<hours>[01]\d|2[0-3]):(?<minutes>[0-5]\d)$/.exec(this.value);
        this.valueNode.textContent = match?.groups ? this.formatTime(Number(match.groups.hours), Number(match.groups.minutes)) : text(this.placeholder);
        const accessibleName = this.accessibleName(), visibleValue = this.valueNode.textContent ?? '';
        this.trigger.accessibleLabel = accessibleName && visibleValue ? `${accessibleName}: ${visibleValue}` : accessibleName || visibleValue;
        this.nativeControl.setAttribute('aria-label', accessibleName);
        this.popup.setAttribute('aria-label', accessibleName);
        this.trigger.disabled = this.unavailable || bool(this.readOnly);
        this.trigger.setAttribute('aria-haspopup', 'listbox');
        this.trigger.setAttribute('aria-controls', this.popup.id);
        aria(this.trigger, 'aria-expanded', this.open);
        this.syncForm(this.value);
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText)));
        const description = [text(this.description), error ? this.validationMessage : ''].filter(Boolean).join(' ') || null;
        aria(this.trigger, 'aria-description', description);
        aria(this.nativeControl, 'aria-description', description);
        aria(this.trigger, 'aria-invalid', error ? true : null);
        aria(this.nativeControl, 'aria-invalid', error ? true : null);
        this.toggleAttribute('data-invalid', error);
        this.syncPopup();
    }
    private syncPopup(): void {
        if (!this.popup)
            return;
        if (bool(this.native) || !bool(this.open))
            this.popupController?.hide();
        else {
            this.popupController?.show();
            this.popup.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'center' });
        }
        if (!this.popupController)
            this.popup.hidden = bool(this.native) || !bool(this.open);
    }
    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options); }
    private formatTime(hours: number, minutes: number): string { return new Intl.DateTimeFormat(this.documentLanguage(), { hour: 'numeric', minute: '2-digit' }).format(new Date(2024, 0, 1, hours, minutes)); }
    private optionNodes(): Button[] { return [...(this.popup?.querySelectorAll<Button>('cb-button:not([disabled])') ?? [])]; }
    private handleKey(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.setOpen(false, event);
            this.trigger?.focus();
            return;
        }
        if (!this.open && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            this.setOpen(true, event);
            const options = this.optionNodes();
            (options.find(option => option.getAttribute('aria-selected') === 'true') ?? (event.key === 'ArrowUp' ? options.at(-1) : options[0]))?.focus();
            return;
        }
        const options = this.optionNodes();
        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && options.length) {
            event.preventDefault();
            const active = this.activeNode();
            const current = active?.localName === 'cb-button' ? options.indexOf(active as Button) : -1;
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            options[current < 0 ? 0 : (current + direction + options.length) % options.length]?.focus();
        }
    }
}
export { TimePickerBase };
export type { TimePickerProps } from './TimePickerBase.js';
