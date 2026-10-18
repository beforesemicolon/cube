import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { normalizeItems, type ActionItem, type NormalizedItem } from '../../core/items.js'
import type { ButtonVariant } from '../button/ButtonBase.js'

export interface ButtonGroupProps extends UIProps {
    orientation?: 'horizontal' | 'vertical'
    items?: ActionItem[]
    variant?: ButtonVariant
}

/** A labeled collection of related actions, independent of its concrete button renderer. */
export abstract class ButtonGroupBase<P extends ButtonGroupProps = ButtonGroupProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'orientation', 'items', 'variant']
    orientation: ButtonGroupProps['orientation'] = 'horizontal'
    items: ActionItem[] = []
    variant: ButtonVariant = 'secondary'
    protected get actions(): NormalizedItem[] { return normalizeItems(this.items).filter(item => !item.separator) }
    protected activate(item: NormalizedItem, originalEvent: Event): void {
        if (this.unavailable || item.disabled) return
        const detail = { value: item.id, item, originalEvent }
        if (this.request('cb-before-action', detail)) this.emit('cb-action', detail)
    }
}
