import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { html, type Template } from '../../core/runtime.js'

import { PopupController, type PopupPlacement } from '../../core/popup.js'
import { HoverCardBase } from './HoverCardBase.js'

export class HoverCard extends HoverCardBase {
    stylesheet = componentStylesheet

    private popup?: PopupController
    render(): Template {
        return html`
            <span ref="anchor" part="anchor"
                onpointerenter="${() => this.schedule(true)}" onpointerleave="${() => this.schedule(false)}" onfocus="${[() => this.schedule(true), true]}" onblur="${[() => this.schedule(false), true]}">
                <slot ref="trigger" name="trigger" part="trigger"></slot>
            </span>
            <article ref="panel" part="card panel" hidden onpointerenter="${() => this.schedule(true)}" onpointerleave="${() => this.schedule(false)}">
                <slot part="content"></slot>
            </article>`
    }
    protected mount(): void {
        const panel = this.refs.panel?.[0], anchor = this.refs.anchor?.[0]
        if (panel instanceof HTMLElement && anchor instanceof HTMLElement) this.popup = new PopupController(panel, anchor, () => this.setOpen(false), {
            placement: () => this.validPlacement(), maxWidth: () => this.popupMaxWidth, maxHeight: () => this.popupMaxHeight,
        })
        super.mount()
    }
    protected unmount(): void { super.unmount(); this.popup?.dispose(); this.popup = undefined }
    protected syncView(): void { if (this.isOpen()) this.popup?.show(); else this.popup?.hide();  }
    private validPlacement(): PopupPlacement { return ['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(this.placement) ? this.placement : 'bottom-start' }

}
export { HoverCardBase };
export type { HoverCardProps } from './HoverCardBase.js';

register('cb-hover-card', HoverCard)
