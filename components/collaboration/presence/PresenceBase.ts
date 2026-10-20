import { Component, type ComponentProps } from '../../core/Component.js'
import { finite, scalarText } from '../../core/value.js'
import type { AvatarStatus } from '../../data-display/avatar/AvatarBase.js'

export interface PresenceItem {
    id: string
    label: string
    accessibleLabel?: string
    description?: string
    src?: string
    initials?: string
    color?: string
    status?: AvatarStatus
    statusLabel?: string
    disabled?: boolean
}

export interface PresenceProps extends ComponentProps {
    items?: readonly PresenceItem[]
    maxVisible?: number
    summary?: string
    overflowLabel?: string
    emptyLabel?: string
}

/** Headless collaborator-list behavior shared by Presence renderers. */
export abstract class PresenceBase extends Component<PresenceProps> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'items', 'max-visible', 'summary', 'overflow-label', 'empty-label',
    ]

    items: readonly PresenceItem[] = []
    maxVisible = 2
    summary = ''
    overflowLabel = ''
    emptyLabel = ''

    get presenceItems(): readonly PresenceItem[] { return Array.isArray(this.items) ? this.items : [] }
    get visibleItems(): readonly PresenceItem[] { return this.presenceItems.slice(0, Math.max(1, Math.floor(finite(this.maxVisible, 2)))) }
    get hiddenItems(): readonly PresenceItem[] { return this.presenceItems.slice(this.visibleItems.length) }
    get summaryText(): string { return scalarText(this.summary) }
    get emptyText(): string { return scalarText(this.emptyLabel) }
    get presenceLabel(): string { return this.accessibleName() }
    overflowText(count = this.hiddenItems.length): string {
        return scalarText(this.overflowLabel).replaceAll('{count}', String(count)) || `+${count}`
    }

    activate(item: PresenceItem, originalEvent?: Event): boolean {
        if (this.unavailable || item.disabled) return false
        const detail = { item, value: item.id, originalEvent }
        if (!this.request('beforeaction', detail)) return false
        this.emit('action', detail)
        return true
    }

    activateOverflow(originalEvent?: Event): boolean {
        if (this.unavailable || !this.hiddenItems.length) return false
        const detail = { items: this.hiddenItems, count: this.hiddenItems.length, originalEvent }
        if (!this.request('beforeoverflow', detail)) return false
        this.emit('overflow', detail)
        return true
    }
}
