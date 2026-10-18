import { UIComponent, type UIProps } from '../core/UIComponent.js'
import { normalizeItems, type ActionItem, type NormalizedItem } from '../core/items.js'
import { scalarText } from '../core/value.js'

export interface ChoiceGroupProps extends UIProps {
    items?: ActionItem[]
    value?: string
    orientation?: 'horizontal' | 'vertical'
}

/** Single-selection behavior shared by segmented controls and tabs. */
export abstract class ChoiceGroupBase<P extends ChoiceGroupProps = ChoiceGroupProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'items', 'value', 'orientation']
    items: ActionItem[] = []
    value = ''
    orientation: ChoiceGroupProps['orientation'] = 'horizontal'
    protected get choices(): NormalizedItem[] { return normalizeItems(this.items).filter(item => !item.separator) }

    protected choose(item: NormalizedItem, originalEvent: Event): void {
        if (this.unavailable || item.disabled || item.id === scalarText(this.value)) return
        const detail = { value: item.id, item, originalEvent }
        if (!this.request('cb-before-change', detail)) return
        this.value = item.id
        this.syncView()
        this.emit('cb-change', detail)
    }
}
