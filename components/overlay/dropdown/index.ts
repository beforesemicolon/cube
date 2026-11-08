import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { bool } from '../../core/value.js'
import { when, html, type Template } from '../../core/runtime.js'

import type { NormalizedItem } from '../../core/items.js'
import { DropdownBase } from './DropdownBase.js'

export class Dropdown extends DropdownBase {
    stylesheet = componentStylesheet

    protected triggerElement(): HTMLElement | undefined {
        const node = this.refs.anchor?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    protected popupElement(): HTMLElement | undefined {
        const node = this.refs.popup?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    private menuElement(): HTMLElement | undefined {
        const node = this.refs.menu?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    private defaultTriggerElement(): HTMLElement | undefined {
        const node = this.refs.defaultTrigger?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    private stopTriggerAction = (event: Event): void => event.stopPropagation()
    private syncTrigger = (): void => {
        const slot = this.refs.triggerSlot?.[0]
        if (!(slot instanceof HTMLSlotElement)) return
        for (const element of slot.assignedElements({ flatten: true })) {
            element.setAttribute('aria-expanded', String(bool(this.open)))
            element.setAttribute('aria-haspopup', 'menu')
        }
    }
    protected syncView(): void {
        this.syncTrigger()
        this.defaultTriggerElement()?.setAttribute(
            'accessible-label',
            this.accessibleName()
        )
        if (bool(this.open) && Array.isArray(this.items))
            queueMicrotask(() => this.menuElement()?.focus())
    }
    protected mount(): void {
        const anchor = this.triggerElement()
        if (anchor) {
            this.listen(anchor, 'beforeaction', this.stopTriggerAction)
            this.listen(anchor, 'action', this.stopTriggerAction)
        }
        super.mount()
    }
    render(): Template {
        return html` <span
                ref="anchor"
                part="trigger trigger-anchor"
                onclick="${() => this.toggle()}"
                onslotchange="${this.syncTrigger}"
            >
                <slot
                    ref="triggerSlot"
                    name="trigger"
                    part="trigger-slot"
                >
                    <cb-button
                        ref="defaultTrigger"
                        part="default-trigger"
                        exportparts="control:trigger-control,label:trigger-label,icon:trigger-icon,spinner:trigger-spinner"
                        label="${this.props.label}"
                        icon="${this.props.icon}"
                        icon-src=${this.props.iconSrc}
                        loading="${this.props.loading}"
                        accessible-label="${this.accessibleName}"
                        disabled="${() => this.unavailable}"
                        size="${this.props.size}"
                        variant="${this.props.variant}"
                        icon-only="${this.props.iconOnly}"
                        icon-only-at="${this.props.iconOnlyAt}"
                        wrap="${this.props.wrap}"
                        aria-haspopup="menu"
                        aria-expanded="${when(this.props.open, 'true', 'false')}"
                    ><span part="trigger-content" data-caret-position="${this.props.caretPosition}"><span part="trigger-text">${this.props.label}</span>${when(this.props.caretPosition, html`<cb-icon part="caret" name="down" decorative="true"></cb-icon>`)}</span></cb-button>
                </slot>
            </span>
            <div ref="popup" part="popup" hidden>
                ${when(
                    () => Array.isArray(this.items),
                    () =>
                        html`<cb-menu
                            ref="menu"
                            part="menu"
                            items="${() => this.items ?? []}"
                            disabled="${() => this.unavailable}"
                            accessible-label="${this.accessibleName}"
                            onbeforeaction="${(event: Event) => event.stopPropagation()}"
                            onaction="${(
                                event: CustomEvent<{ item: NormalizedItem }>
                            ) => {
                                event.stopPropagation()
                                if (this.select(event.detail.item, event))
                                    this.setOpen(false)
                            }}"
                        ></cb-menu>`,
                    () => html`<div part="content"><slot></slot></div>`
                )}
            </div>`
    }
}
export { DropdownBase }
export type { DropdownProps } from './DropdownBase.js'

register('cb-dropdown', Dropdown)
