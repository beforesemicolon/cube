import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { PopupController, type PopupPlacement } from '../../core/popup.js';
import { HoverCardBase } from './HoverCardBase.js';
export class HoverCard extends HoverCardBase {
    private anchor?: HTMLElement;
    private card?: HTMLElement;
    private popup?: PopupController;
    render(): Template {
        this.anchor = element('span', { attributes: { part: 'anchor' } }) as HTMLSpanElement;
        this.anchor.append(element("slot", { attributes: { name: 'trigger', part: 'trigger' }, textContent: '' }) as HTMLSlotElement);
        this.card = element('article', { attributes: { part: 'card panel' } }) as HTMLElement;
        this.card.hidden = true;
        this.card.append(element("slot", { attributes: { name: '', part: 'content' }, textContent: '' }) as HTMLSlotElement);
        for (const node of [this.anchor, this.card]) {
            node.addEventListener('pointerenter', () => this.schedule(true));
            node.addEventListener('pointerleave', () => this.schedule(false));
        }
        this.anchor.addEventListener('focusin', () => this.schedule(true));
        this.anchor.addEventListener('focusout', () => this.schedule(false));
        return html`<style part="styles">${editorCSS + `
:host{display:inline-flex;position:relative}[part~=anchor]{display:inline-flex}
[part~=card]{z-index:var(--z-index-popover,50);inline-size:var(--component-hover-card-width,300px);box-sizing:border-box;overflow:auto;padding:var(--spacing-md,12px);border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface-raised,var(--color-surface));color:var(--color-foreground);box-shadow:0 12px 32px color-mix(in srgb,var(--color-foreground) 18%,transparent)}
`}</style>${this.anchor}${this.card}`;
    }
    protected mount(): void {
        if (this.card && this.anchor)
            this.popup = new PopupController(this.card, this.anchor, () => this.setOpen(false), {
                placement: () => this.validPlacement(),
                maxWidth: () => this.popupMaxWidth,
                maxHeight: () => this.popupMaxHeight,
            });
        super.mount();
    }
    protected unmount(): void { super.unmount(); this.popup?.dispose(); this.popup = undefined; }
    protected syncView(): void {
        if (this.isOpen())
            this.popup?.show();
        else
            this.popup?.hide();
    }
    private validPlacement(): PopupPlacement { return ['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(this.placement) ? this.placement : 'bottom-start'; }
}
export { HoverCardBase };
export type { HoverCardProps } from './HoverCardBase.js';
