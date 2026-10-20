import { ChoiceGroupBase, type ChoiceGroupProps } from '../ChoiceGroupBase.js'
import type { ActionItem } from '../../core/items.js'
import { scalarText } from '../../core/value.js'

export interface TabItem extends ActionItem { closable?: boolean; dirty?: boolean }
export interface TabsProps extends Omit<ChoiceGroupProps, 'items'> { items?: TabItem[]; activation?: 'automatic' | 'manual'; closeLabel?: string }

/** Headless tab selection and activation policy. */
export abstract class TabsBase<P extends TabsProps = TabsProps> extends ChoiceGroupBase<P> {
    static observedAttributes = [...ChoiceGroupBase.observedAttributes, 'activation', 'close-label']
    declare items: TabItem[]
    activation: TabsProps['activation'] = 'automatic'
    closeLabel = ''

    protected closeTab(item: TabItem, originalEvent: Event): boolean {
        originalEvent.stopPropagation()
        if (this.unavailable || item.disabled || !item.closable) return false
        const choices = this.choices
        const index = choices.findIndex(choice => choice.id === item.id)
        const remaining = this.items.filter(candidate => scalarText(candidate.id) !== item.id)
        const nextValue = scalarText(this.value) === item.id
            ? scalarText(remaining[Math.min(index, remaining.length - 1)]?.id)
            : scalarText(this.value)
        const detail = { id: item.id, item, items: remaining, value: nextValue, originalEvent }
        if (!this.request('beforeclose', detail)) return false
        this.items = remaining
        this.value = nextValue
        this.syncView()
        this.emit('close', detail)
        return true
    }
}
