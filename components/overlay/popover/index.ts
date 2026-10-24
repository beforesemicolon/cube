import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { html, type Template } from '../../core/runtime.js'

import { PopupController, type PopupPlacement } from '../../core/popup.js'
import { PopoverBase } from './PopoverBase.js'

export class Popover extends PopoverBase {
    stylesheet = componentStylesheet

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

register('cb-popover', Popover)
