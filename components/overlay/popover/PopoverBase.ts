import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool } from '../../core/value.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength, type PopupPlacement } from '../../core/popup.js'

export interface PopoverProps extends UIProps, PopupConstraintProps { open?: boolean; placement?: PopupPlacement }

/** Anchored disclosure state without prescribing trigger or panel content. */
export abstract class PopoverBase<P extends PopoverProps = PopoverProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'open', 'placement', ...popupConstraintAttributes]
    open = false
    placement: PopupPlacement = 'bottom-start'
    popupMaxWidth: PopupLength = '360px'
    popupMaxHeight: PopupLength = '480px'
    protected isOpen(): boolean { return this.hasAttribute('open') || bool(this.open) }
    show(originalEvent?: Event): boolean { return this.setOpen(true, originalEvent) }
    close(originalEvent?: Event): boolean { return this.setOpen(false, originalEvent) }
    toggle(originalEvent?: Event): boolean { return this.setOpen(!this.isOpen(), originalEvent) }
    private setOpen(open: boolean, originalEvent?: Event): boolean {
        if (this.unavailable || this.isOpen() === open) return !this.unavailable
        const detail = { open, originalEvent }
        if (!this.request(open ? 'cb-before-open' : 'cb-before-close', detail)) return false
        this.open = open
        this.toggleAttribute('open', open)
        this.syncView()
        this.emit(open ? 'cb-open' : 'cb-close', detail)
        this.emit('cb-open-change', detail)
        return true
    }
}
