import { Component, type ComponentProps } from '../core/Component.js'
import { normalizeItems, type ActionItem, type NormalizedItem } from '../core/items.js'
import { bool, scalarText } from '../core/value.js'

export interface ChoiceGroupProps extends ComponentProps {
    items?: ActionItem[]
    value?: string
    stacked?: boolean
}

/** Single-selection behavior shared by segmented controls and tabs. */
export abstract class ChoiceGroupBase<P extends ChoiceGroupProps = ChoiceGroupProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'items', 'value', 'stacked']
    items: ActionItem[] = []
    value = ''
    stacked = false
    protected get navigationAxis(): 'horizontal' | 'vertical' { return bool(this.stacked) ? 'vertical' : 'horizontal' }
    protected get choices(): NormalizedItem[] { return normalizeItems(this.items).filter(item => !item.separator) }

    protected choose(item: NormalizedItem, originalEvent: Event): void {
        originalEvent.stopPropagation()
        if (this.unavailable || item.disabled || item.id === scalarText(this.value)) return
        const detail = { value: item.id, previousValue: this.value, item, originalEvent }
        if (!this.request('beforechange', detail)) return
        this.value = item.id
        this.syncView()
        this.emit('change', detail)
    }
}
