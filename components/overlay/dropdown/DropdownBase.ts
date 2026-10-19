import { Component, type ComponentProps } from '../../core/Component.js'
import type { ActionItem, NormalizedItem } from '../../core/items.js'
import { PopupController, popupConstraintAttributes, type PopupConstraintProps, type PopupLength, type PopupPlacement } from '../../core/popup.js'
import { bool } from '../../core/value.js'

export interface DropdownProps extends ComponentProps, PopupConstraintProps {
    items?: ActionItem[]
    value?: string
    loading?: boolean
    open?: boolean
    placement?: PopupPlacement
    icon?: string
}

/** Trigger, popup positioning and open-state behavior without choosing either renderer. */
export abstract class DropdownBase<P extends DropdownProps = DropdownProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'items', 'value', 'loading', 'open', 'placement', 'icon', ...popupConstraintAttributes]
    items: ActionItem[] = []
    value = ''
    loading = false
    open = false
    placement: PopupPlacement = 'bottom-start'
    icon = ''
    popupMaxWidth: PopupLength = '320px'
    popupMaxHeight: PopupLength = '360px'
    private popupController?: PopupController
    protected abstract triggerElement(): HTMLElement | undefined
    protected abstract popupElement(): HTMLElement | undefined

    protected mount(): void {
        const trigger = this.triggerElement(), popup = this.popupElement()
        if (trigger && popup) {
            this.popupController = new PopupController(popup, trigger, () => this.setOpen(false), {
                placement: () => this.placement,
                maxWidth: () => this.popupMaxWidth,
                maxHeight: () => this.popupMaxHeight,
            })
            this.cleanup(() => this.popupController?.dispose())
        }
        super.mount()
    }
    protected update(name: string): void { super.update(name); this.syncPopup() }
    protected toggle(): void { if (!this.unavailable) this.setOpen(!bool(this.open)) }
    protected select(item: NormalizedItem, originalEvent: Event, source: 'menu' | 'primary' = 'menu'): boolean {
        if (this.unavailable || bool(this.loading) || item.disabled || item.separator) return false
        const detail = { value: item.id, item, source, originalEvent }
        if (!this.request('beforechange', detail)) return false
        this.value = item.id
        this.syncView()
        this.emit('change', detail)
        return true
    }
    protected setOpen(open: boolean): void {
        if (this.unavailable && open || bool(this.open) === open) return
        const detail = { open }
        if (!this.request('beforeopenchange', detail)) return
        this.open = open; this.toggleAttribute('open', open); this.syncView(); this.syncPopup(); this.emit('openchange', detail)
    }
    protected syncPopup(): void {
        if (bool(this.open)) this.popupController?.show(); else this.popupController?.hide()
    }
}
