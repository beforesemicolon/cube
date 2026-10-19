import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { bool } from '../../core/value.js';
import { PopupController, type PopupPlacement } from '../../core/popup.js';
import { PopoverBase } from './PopoverBase.js';
export class Popover extends PopoverBase {
    private anchor?: HTMLElement;
    private panel?: HTMLElement;
    private triggerSlot?: HTMLSlotElement;
    private popup?: PopupController;
    render(): Template {
        this.anchor = element('span', { attributes: { part: 'anchor' } }) as HTMLSpanElement;
        this.triggerSlot = element("slot", { attributes: { name: 'trigger', part: 'trigger' }, textContent: '' }) as HTMLSlotElement;
        this.anchor.append(this.triggerSlot);
        this.panel = element('section', { attributes: { part: 'popover panel' } }) as HTMLElement;
        this.panel.setAttribute('role', 'dialog');
        this.panel.hidden = true;
        this.panel.append(element("slot", { attributes: { name: '', part: 'content' }, textContent: '' }) as HTMLSlotElement);
        this.anchor.addEventListener('click', event => this.toggle(event));
        this.triggerSlot.addEventListener('slotchange', () => this.syncTrigger());
        return html`<style part="styles">${editorCSS + `
:host{display:inline-flex;position:relative}[part~=anchor]{display:inline-flex}
[part~=popover]{z-index:var(--z-index-popover,50);inline-size:var(--component-popover-width,max-content);box-sizing:border-box;overflow:auto;padding:var(--spacing-md,12px);border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface-raised,var(--color-surface));color:var(--color-foreground);box-shadow:var(--component-popover-shadow,0 12px 32px color-mix(in srgb,var(--color-foreground) 18%,transparent))}
`}</style>${this.anchor}${this.panel}`;
    }
    protected mount(): void {
        if (this.panel && this.anchor)
            this.popup = new PopupController(this.panel, this.anchor, () => this.close(), {
                placement: () => this.validPlacement(),
                maxWidth: () => this.popupMaxWidth,
                maxHeight: () => this.popupMaxHeight,
            });
        super.mount();
    }
    protected unmount(): void { this.popup?.dispose(); this.popup = undefined; }
    protected syncView(): void {
        if (!this.panel || !this.anchor)
            return;
        this.panel.setAttribute('aria-label', this.accessibleName());
        if (this.isOpen())
            this.popup?.show();
        else
            this.popup?.hide();
        this.syncTrigger();
    }
    private validPlacement(): PopupPlacement { return ['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(this.placement) ? this.placement : 'bottom-start'; }
    private syncTrigger(): void {
        if (!this.triggerSlot || !this.panel)
            return;
        for (const element of this.triggerSlot.assignedElements()) {
            element.setAttribute('aria-expanded', String(this.isOpen()));
            element.setAttribute('aria-haspopup', 'dialog');
        }
    }
}
export { PopoverBase };
export type { PopoverProps } from './PopoverBase.js';
