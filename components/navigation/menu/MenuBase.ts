import { Component, type ComponentProps } from '../../core/Component.js'
import {
    normalizeItems,
    type ActionItem,
    type NormalizedItem,
} from '../../core/items.js'

export type MenuVariant = 'icon' | 'label' | 'both'

export interface MenuProps extends ComponentProps {
    items?: ActionItem[]
    loop?: boolean
    gap?: string
    active?: string
    variant?: MenuVariant
}

/** Menu item normalization and activation without choosing popup or inline rendering. */
export abstract class MenuBase<
    P extends MenuProps = MenuProps,
> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'items',
        'loop',
        'gap',
        'active',
        'variant',
    ]
    items: ActionItem[] = []
    loop = true
    gap = '1px'
    active = ''
    variant: MenuVariant = 'both'
    get normalizedItems(): NormalizedItem[] {
        const items = normalizeItems(this.items)
        let previousGroup = 'default'
        return items.flatMap((item, index) => {
            if (item.separator) {
                previousGroup = 'default'
                return [item]
            }
            const group = item.group?.trim() || 'default'
            const separated =
                index > 0 &&
                group !== previousGroup &&
                !items[index - 1]?.separator
            previousGroup = group
            return separated
                ? [
                      {
                          id: `group-separator-${index}`,
                          label: '',
                          description: '',
                          disabled: true,
                          separator: true,
                      },
                      item,
                  ]
                : [item]
        })
    }
    resolvedMenuLabel = (): string => this.accessibleName()

    protected activate(item: NormalizedItem, originalEvent: Event): void {
        if (this.unavailable || item.disabled || item.separator) return
        const detail = {
            id: item.id,
            item,
            originalEvent,
            ...(item.type === 'checkbox' || item.type === 'radio'
                ? { checked: !item.checked }
                : {}),
        }
        if (!this.request('beforeaction', detail)) return
        this.emit('action', detail)
    }
}
