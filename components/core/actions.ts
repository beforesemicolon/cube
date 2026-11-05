import { bool, scalarText } from './value.js'

/** An application-owned command; name is the button name, label its accessible text. */
export interface ComponentAction {
    readonly id: string
    readonly icon?: string
    readonly iconSrc?: string
    readonly name?: string
    readonly label: string
    readonly shortcut?: string
    readonly disabled?: boolean
    readonly indicator?: boolean
    readonly indicatorLabel?: string
}

export function normalizeActions(actions: readonly ComponentAction[]): readonly ComponentAction[] {
    const ids = new Set<string>()
    return (Array.isArray(actions) ? actions : []).flatMap((action: ComponentAction) => {
        if (!action || typeof action !== 'object') return []
        const id = scalarText(action.id).trim(), label = scalarText(action.label).trim()
        if (!id || !label || ids.has(id)) return []
        ids.add(id)
        return [{ id, label, name: scalarText(action.name), icon: scalarText(action.icon), disabled: bool(action.disabled),
            ...(action.shortcut ? { shortcut: scalarText(action.shortcut) } : {}),
            ...(action.iconSrc ? { iconSrc: scalarText(action.iconSrc) } : {}),
            ...(action.indicator !== undefined ? { indicator: bool(action.indicator), indicatorLabel: scalarText(action.indicatorLabel) || 'Modified' } : {}) }]
    })
}
