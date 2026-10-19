import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, finite, scalarText } from '../../core/value.js'
import type { ButtonVariant } from '../../action/button/ButtonBase.js'

export type AccordionVariant = 'simple' | 'container'
export type AccordionContent = Node | string | number | boolean | null | undefined | readonly Node[]

export interface AccordionItemContext {
    readonly accordion: AccordionBase
    readonly item: AccordionItem
    readonly index: number
}

export interface AccordionAction {
    readonly id: string
    readonly label: string
    readonly icon?: string
    readonly disabled?: boolean
    readonly variant?: ButtonVariant
}

export interface AccordionItem {
    readonly id: string
    readonly label: string
    readonly description?: string
    readonly disabled?: boolean
    readonly disabledReason?: string
    readonly expanded?: boolean
    readonly content?: AccordionContent
    readonly actions?: readonly AccordionAction[]
    readonly renderContent?: (context: AccordionItemContext) => AccordionContent
    readonly renderActions?: (context: AccordionItemContext) => AccordionContent
    readonly slot?: string
}

export interface AccordionExpansionDetail {
    readonly item: AccordionItem
    readonly id: string
    readonly expanded: boolean
    readonly expandedIds: readonly string[]
    readonly originalEvent?: Event
}

export interface AccordionBulkExpansionDetail {
    readonly items: readonly AccordionItem[]
    readonly expanded: boolean
    readonly expandedIds: readonly string[]
}

export type AccordionExpansionChangeDetail = AccordionExpansionDetail | AccordionBulkExpansionDetail

export interface AccordionProps extends ComponentProps {
    items?: readonly AccordionItem[]
    expandedIds?: readonly string[]
    multiple?: boolean
    collapsible?: boolean
    animated?: boolean
    variant?: AccordionVariant
    headingLevel?: number
    emptyLabel?: string
}

/** Renderer-independent accordion behavior, including expansion policy and public controls. */
export abstract class AccordionBase extends Component<AccordionProps> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'items', 'expanded-ids', 'multiple', 'collapsible', 'animated', 'variant', 'heading-level', 'empty-label',
    ]

    items: readonly AccordionItem[] = []
    expandedIds: readonly string[] = []
    multiple = false
    collapsible = true
    animated = true
    variant: AccordionVariant = 'simple'
    headingLevel = 2
    emptyLabel = ''

    private initializedWithItems = false

    itemList(): readonly AccordionItem[] {
        if (!Array.isArray(this.items)) return []
        const seen = new Set<string>()
        return this.items.filter(item => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) return false
            const id = scalarText(item.id).trim()
            if (!id || seen.has(id)) return false
            seen.add(id)
            return true
        })
    }

    expansionSet(): Set<string> {
        const items = this.itemList()
        const valid = new Set(items.map(item => scalarText(item.id).trim()))
        let expanded = new Set(Array.isArray(this.expandedIds) ? this.expandedIds.map(String).filter(id => valid.has(id)) : [])
        if (!this.initializedWithItems && items.length) {
            this.initializedWithItems = true
            if (!expanded.size) expanded = new Set(items.filter(item => bool(item.expanded) && !this.itemDisabled(item)).map(item => item.id))
        }
        if (!bool(this.multiple) && expanded.size > 1) expanded = new Set([...expanded].slice(0, 1))
        if (!bool(this.collapsible) && !expanded.size) {
            const first = items.find(item => !this.itemDisabled(item))
            if (first) expanded.add(first.id)
        }
        const normalized = [...expanded]
        if (!sameStrings(this.expandedIds, normalized)) this.expandedIds = normalized
        return expanded
    }

    itemExpanded(id: string): boolean { return this.expansionSet().has(id) }
    itemDisabled(item: AccordionItem): boolean { return this.unavailable || bool(item.disabled) }
    resolvedVariant(): AccordionVariant { return this.variant === 'container' ? 'container' : 'simple' }
    resolvedHeadingLevel(): number { return Math.min(6, Math.max(1, Math.round(finite(this.headingLevel, 2)))) }

    expand(id: string, originalEvent?: Event): boolean { return this.changeExpansion(id, true, originalEvent) }
    collapse(id: string, originalEvent?: Event): boolean { return this.changeExpansion(id, false, originalEvent) }
    toggle(id: string, originalEvent?: Event): boolean { return this.changeExpansion(id, !this.itemExpanded(id), originalEvent) }

    expandAll(): boolean {
        const available = this.itemList().filter(item => !this.itemDisabled(item))
        if (!available.length) return false
        if (!bool(this.multiple)) return this.expand(available[0].id)
        return this.changeExpandedIds(available.map(item => item.id), true)
    }

    collapseAll(): boolean {
        if (!bool(this.collapsible)) return false
        return this.changeExpandedIds([], false)
    }

    focusItem(id: string): boolean {
        const trigger = [...this.contentRoot.querySelectorAll<HTMLButtonElement>('[part~="trigger"]')]
            .find(candidate => candidate.dataset.accordionId === id)
        if (!trigger || trigger.disabled) return false
        trigger.focus()
        return true
    }

    private changeExpansion(id: string, expanded: boolean, originalEvent?: Event): boolean {
        const item = this.itemList().find(candidate => candidate.id === id)
        if (!item || this.itemDisabled(item)) return false
        const current = this.expansionSet()
        if (current.has(id) === expanded) return false
        if (!expanded && !bool(this.collapsible) && current.size === 1) return false
        const next = new Set(current)
        if (expanded) {
            if (!bool(this.multiple)) next.clear()
            next.add(id)
        } else next.delete(id)
        const expandedIds = [...next]
        const detail: AccordionExpansionDetail = { item, id, expanded, expandedIds, originalEvent }
        if (!this.request('cb-before-expansion-change', detail)) return false
        this.expandedIds = expandedIds
        this.syncView()
        this.emit('cb-expansion-change', detail)
        return true
    }

    private changeExpandedIds(ids: readonly string[], expanded: boolean): boolean {
        const available = this.itemList().filter(item => !this.itemDisabled(item))
        const valid = new Set(available.map(item => item.id))
        const next = [...new Set(ids.filter(id => valid.has(id)))]
        const limited = bool(this.multiple) ? next : next.slice(0, 1)
        if (sameStrings(this.expansionSet(), limited)) return false
        const detail: AccordionBulkExpansionDetail = { items: available, expanded, expandedIds: limited }
        if (!this.request('cb-before-expansion-change', detail)) return false
        this.expandedIds = limited
        this.syncView()
        this.emit('cb-expansion-change', detail)
        return true
    }
}

function sameStrings(left: readonly string[] | Set<string>, right: readonly string[]): boolean {
    const values = left instanceof Set ? [...left] : Array.isArray(left) ? left.map(String) : []
    return values.length === right.length && values.every((value, index) => value === right[index])
}
