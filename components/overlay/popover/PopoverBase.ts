import { Component, type ComponentProps } from '../../core/Component.js'
import { bool } from '../../core/value.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength, type PopupPlacement } from '../../core/popup.js'

export interface PopoverProps extends ComponentProps, PopupConstraintProps { open?: boolean; placement?: PopupPlacement }

/** Anchored disclosure state without prescribing trigger or panel content. */
export abstract class PopoverBase<P extends PopoverProps = PopoverProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'open', 'placement', ...popupConstraintAttributes]
    open = false
    placement: PopupPlacement = 'bottom-start'
    popupMaxWidth: PopupLength = '360px'
    popupMaxHeight: PopupLength = '480px'
    protected isOpen(): boolean { return this.hasAttribute('open') || bool(this.open) }
    show(originalEvent?: Event): boolean { return this.setOpen(true, originalEvent) }
    close(originalEvent?: Event): boolean { return this.setOpen(false, originalEvent) }
    toggle = (originalEvent?: Event): boolean => { return this.setOpen(!this.isOpen(), originalEvent) }
    private setOpen(open: boolean, originalEvent?: Event): boolean {
        if (this.unavailable || this.isOpen() === open) return !this.unavailable
        const detail = { open, originalEvent }
        if (!this.request(open ? 'beforeopen' : 'beforeclose', detail)) return false
        this.open = open
        this.toggleAttribute('open', open)
        this.syncView()
        this.emit(open ? 'open' : 'close', detail)
        this.emit('openchange', detail)
        return true
    }
}
