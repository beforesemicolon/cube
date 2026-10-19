import { Component, type ComponentProps } from '../../core/Component.js'
import { normalizeItems, type ActionItem, type NormalizedItem } from '../../core/items.js'

export interface MenuProps extends ComponentProps { items?: ActionItem[]; loop?: boolean }

/** Menu item normalization and activation without choosing popup or inline rendering. */
export abstract class MenuBase<P extends MenuProps = MenuProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'items', 'loop']
    items: ActionItem[] = []
    loop = true
    get normalizedItems(): NormalizedItem[] { return normalizeItems(this.items) }
    resolvedMenuLabel(): string { return this.accessibleName() }

    protected activate(item: NormalizedItem, originalEvent: Event): void {
        if (this.unavailable || item.disabled || item.separator) return
        const checked = item.type === 'checkbox' || item.type === 'radio' ? !item.checked : undefined
        const detail = { id: item.id, item, checked, originalEvent }
        if (!this.request('cb-before-action', detail)) return
        this.emit('cb-action', detail)
    }
}
