import { css as componentStyles, html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { PopupController, type PopupPlacement } from '../../core/popup.js'
import { PopoverBase } from './PopoverBase.js'
const css = editorCSS + `
:host{display:inline-flex;position:relative}[part~=anchor]{display:inline-flex}
[part~=popover]{z-index:var(--z-index-popover,50);inline-size:var(--component-popover-width,max-content);box-sizing:border-box;overflow:auto;padding:var(--spacing-md,12px);border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface-raised,var(--color-surface));color:var(--color-foreground);box-shadow:var(--component-popover-shadow,0 12px 32px color-mix(in srgb,var(--color-foreground) 18%,transparent))}
`;
export class Popover extends PopoverBase {
    stylesheet = componentStyles`${css}`

    private popup?: PopupController
    render(): Template {
        return html`
            <span ref="anchor" part="anchor" onslotchange="${this.syncTrigger}"
                onclick="${this.toggle}">
                <slot ref="trigger" name="trigger" part="trigger"></slot>
            </span>
            <section ref="panel" part="popover panel" hidden role="dialog" aria-label="${this.accessibleName}">
                <slot part="content"></slot>
            </section>`
    }
    protected mount(): void {
        const panel = this.refs.panel?.[0], anchor = this.refs.anchor?.[0]
        if (panel instanceof HTMLElement && anchor instanceof HTMLElement) this.popup = new PopupController(panel, anchor, () => this.close(), {
            placement: () => this.validPlacement(), maxWidth: () => this.popupMaxWidth, maxHeight: () => this.popupMaxHeight,
        })
        super.mount()
    }
    protected unmount(): void { this.popup?.dispose(); this.popup = undefined }
    protected syncView(): void { if (this.isOpen()) this.popup?.show(); else this.popup?.hide(); this.syncTrigger() }
    private validPlacement(): PopupPlacement { return ['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(this.placement) ? this.placement : 'bottom-start' }
    private syncTrigger = (): void => {
        const slot = this.refs.trigger?.[0]
        if (!(slot instanceof HTMLSlotElement)) return
        for (const element of slot.assignedElements()) {
            element.setAttribute('aria-expanded', String(this.isOpen()))
            element.setAttribute('aria-haspopup', 'dialog')
        }
    }
}
export { PopoverBase };
export type { PopoverProps } from './PopoverBase.js';
