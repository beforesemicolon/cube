import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { normalizeItems, type ActionItem, type NormalizedItem } from '../../core/items.js'
import { finite } from '../../core/value.js'

export interface BreadcrumbProps extends UIProps { items?: ActionItem[]; maxItems?: number }

/** Breadcrumb normalization and navigation events without choosing link rendering. */
export abstract class BreadcrumbBase<P extends BreadcrumbProps = BreadcrumbProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'items', 'max-items']
    items: ActionItem[] = []
    maxItems = 5
    protected expanded = false
    protected get crumbs(): NormalizedItem[] { return normalizeItems(this.items).filter(item => !item.separator) }
    protected visibleCrumbs(): Array<NormalizedItem | 'ellipsis'> {
        const items = this.crumbs, maximum = Math.max(2, Math.trunc(finite(this.maxItems, 5)))
        if (this.expanded || items.length <= maximum) return items
        return [items[0], 'ellipsis', ...items.slice(-(maximum - 1))]
    }
    protected navigate(item: NormalizedItem, originalEvent: Event): void {
        if (item.disabled) { originalEvent.preventDefault(); return }
        const detail = { id: item.id, item, originalEvent }
        if (!this.request('cb-before-navigate', detail)) { originalEvent.preventDefault(); return }
        this.emit('cb-navigate', detail)
    }
}
