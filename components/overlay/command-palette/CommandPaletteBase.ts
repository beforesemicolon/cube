import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { normalizeItems, type ActionItem, type NormalizedItem } from '../../core/items.js'
import { scalarText } from '../../core/value.js'

export interface CommandPaletteProps extends UIProps { items?: ActionItem[]; open?: boolean; query?: string; placeholder?: string; emptyLabel?: string }

/** Command filtering and modal open state without prescribing result rendering. */
export abstract class CommandPaletteBase<P extends CommandPaletteProps = CommandPaletteProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'items', 'open', 'query', 'placeholder', 'empty-label']
    items: ActionItem[] = []
    open = false
    query = ''
    placeholder = ''
    emptyLabel = ''
    protected get results(): NormalizedItem[] {
        const query = scalarText(this.query).trim().toLocaleLowerCase()
        const items = normalizeItems(this.items).filter(item => !item.separator)
        return query ? items.filter(item => `${item.label} ${item.description} ${item.shortcut ?? ''}`.toLocaleLowerCase().includes(query)) : items
    }
    show(): void { this.setOpen(true) }
    close(): void { this.setOpen(false) }
    protected setOpen(open: boolean): void {
        if (this.open === open) return
        this.open = open; this.toggleAttribute('open', open); this.syncView(); this.emit('cb-open-change', { open })
    }
    protected select(item: NormalizedItem, originalEvent: Event): void {
        if (item.disabled) return
        const detail = { id: item.id, item, originalEvent }
        if (!this.request('cb-before-action', detail)) return
        this.emit('cb-action', detail); this.close()
    }
}
