import type { Template } from './runtime.js'

export interface ActionItem {
    id?: string
    label?: string
    /** Replaces the complete built-in menu control with custom content. */
    renderItem?: (item: NormalizedItem) => Template | Node | string | number | null
    description?: string
    icon?: string
    iconSrc?: string
    disabled?: boolean
    href?: string
    shortcut?: string
    separator?: boolean
    checked?: boolean
    type?: 'action' | 'checkbox' | 'radio'
    group?: string
    tone?: 'default' | 'danger'
    children?: ActionItem[]
}
export type NormalizedItem = Required<
    Pick<ActionItem, 'id' | 'label' | 'description' | 'disabled' | 'separator'>
> &
    ActionItem
export function normalizeItems(value: unknown): NormalizedItem[] {
    if (!Array.isArray(value)) return []
    const used = new Set<string>()
    return value.flatMap((raw, index) => {
        if (typeof raw === 'string') raw = { id: raw, label: raw }
        if (!raw || typeof raw !== 'object') return []
        const item = raw as ActionItem
        const id =
            typeof item.id === 'string' && item.id ? item.id : `item-${index}`
        if (used.has(id)) return []
        used.add(id)
        return [
            {
                ...item,
                id,
                label: typeof item.label === 'string' ? item.label : '',
                description:
                    typeof item.description === 'string'
                        ? item.description
                        : '',
                disabled: item.disabled === true,
                separator: item.separator === true,
            },
        ]
    })
}
/** Index arithmetic is independent of the DOM and tested separately. */
export function nextEnabled(
    items: Pick<NormalizedItem, 'disabled' | 'separator'>[],
    current: number,
    delta: number,
    loop = true
): number {
    if (!items.length) return -1
    let i = current
    for (let count = 0; count < items.length; count++) {
        i += delta
        if (!loop && (i < 0 || i >= items.length)) return current
        i = (i + items.length) % items.length
        if (!items[i].disabled && !items[i].separator) return i
    }
    return -1
}
export function pageRange(
    page: number,
    total: number,
    radius = 1
): Array<number | 'ellipsis'> {
    const count = Math.max(
            1,
            Math.min(1_000_000, Number.isFinite(total) ? Math.floor(total) : 1)
        ),
        p = Math.min(
            count,
            Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1)
        )
    const values = new Set([1, count])
    for (let i = Math.max(1, p - radius); i <= Math.min(count, p + radius); i++)
        values.add(i)
    const result: Array<number | 'ellipsis'> = []
    let previous = 0
    for (const value of [...values].sort((a, b) => a - b)) {
        if (previous && value - previous > 1)
            result.push(value - previous === 2 ? previous + 1 : 'ellipsis')
        result.push(value)
        previous = value
    }
    return result
}
