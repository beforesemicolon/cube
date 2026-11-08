import { Component, type ComponentProps } from '../../core/Component.js'
import type { ActionItem, NormalizedItem } from '../../core/items.js'
import {
    PopupController,
    popupConstraintAttributes,
    type PopupConstraintProps,
    type PopupLength,
    type PopupPlacement,
} from '../../core/popup.js'
import { bool } from '../../core/value.js'
import type {
    ButtonIconOnlyBreakpoint,
    ButtonVariant,
} from '../../action/button/ButtonBase.js'

export interface DropdownProps extends ComponentProps, PopupConstraintProps {
    items?: ActionItem[] | null
    value?: string
    loading?: boolean
    open?: boolean
    placement?: PopupPlacement
    icon?: string
    iconSrc?: string
    variant?: ButtonVariant
    iconOnly?: boolean
    iconOnlyAt?: ButtonIconOnlyBreakpoint
    wrap?: boolean
    matchTriggerWidth?: boolean
    /** Opt into a caret without changing text direction; omitted preserves the existing trigger. */
    caretPosition?: 'start' | 'end'
}

/** Trigger, popup positioning and open-state behavior without choosing either renderer. */
export abstract class DropdownBase<
    P extends DropdownProps = DropdownProps,
> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'items',
        'value',
        'loading',
        'open',
        'placement',
        'icon',
        'icon-src',
        'variant',
        'icon-only',
        'icon-only-at',
        'wrap',
        'match-trigger-width',
        'caret-position',
        ...popupConstraintAttributes,
    ]
    items: ActionItem[] | null = null
    value = ''
    loading = false
    open = false
    placement: PopupPlacement = 'bottom-start'
    icon = ''
    iconSrc = ''
    variant: ButtonVariant = 'secondary'
    iconOnly = false
    iconOnlyAt: ButtonIconOnlyBreakpoint = ''
    wrap = false
    matchTriggerWidth = false
    caretPosition: 'start' | 'end' | undefined = undefined
    popupMaxWidth: PopupLength = '320px'
    popupMaxHeight: PopupLength = '360px'
    private popupController?: PopupController
    protected abstract triggerElement(): HTMLElement | undefined
    protected abstract popupElement(): HTMLElement | undefined

    protected mount(): void {
        const trigger = this.triggerElement(),
            popup = this.popupElement()
        if (trigger && popup) {
            this.popupController = new PopupController(
                popup,
                trigger,
                () => this.setOpen(false),
                {
                    placement: () => this.placement,
                    maxWidth: () => this.popupMaxWidth,
                    maxHeight: () => this.popupMaxHeight,
                    matchAnchorWidth: () => bool(this.matchTriggerWidth),
                    dismissOnFocusOutside: true,
                }
            )
            this.cleanup(() => this.popupController?.dispose())
        }
        super.mount()
    }
    protected update(name: string): void {
        super.update(name)
        this.syncPopup()
    }
    protected toggle(): void {
        if (!this.unavailable) this.setOpen(!bool(this.open))
    }
    protected select(
        item: NormalizedItem,
        originalEvent: Event,
        source: 'menu' | 'primary' = 'menu'
    ): boolean {
        if (
            this.unavailable ||
            bool(this.loading) ||
            item.disabled ||
            item.separator
        )
            return false
        const detail = {
            value: item.id,
            previousValue: this.value,
            item,
            source,
            originalEvent,
        }
        if (!this.request('beforechange', detail)) return false
        this.value = item.id
        this.syncView()
        this.emit('change', detail)
        return true
    }
    protected setOpen(open: boolean): void {
        if ((this.unavailable && open) || bool(this.open) === open) return
        const detail = { open }
        if (!this.request('beforeopenchange', detail)) return
        this.open = open
        this.toggleAttribute('open', open)
        this.syncView()
        this.syncPopup()
        this.emit('openchange', detail)
    }
    protected syncPopup(): void {
        if (bool(this.open)) this.popupController?.show()
        else this.popupController?.hide()
    }
}
