import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, finite } from '../../core/value.js'

export type ExpandableSectionVariant = 'default' | 'container' | 'footer'

export interface ExpandableSectionProps extends ComponentProps {
    expanded?: boolean
    variant?: ExpandableSectionVariant
    headingLevel?: number
    counter?: string
    disableContentPadding?: boolean
}

export interface ExpandableSectionChangeDetail {
    readonly expanded: boolean
    readonly originalEvent?: Event
}

/** Renderer-independent disclosure state and cancelable expansion behavior. */
export abstract class ExpandableSectionBase extends Component<ExpandableSectionProps> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'expanded', 'variant', 'heading-level', 'counter', 'disable-content-padding',
    ]

    expanded = false
    variant: ExpandableSectionVariant = 'default'
    headingLevel = 2
    counter = ''
    disableContentPadding = false

    protected abstract syncView(): void

    resolvedVariant(): ExpandableSectionVariant {
        return this.variant === 'container' || this.variant === 'footer' ? this.variant : 'default'
    }

    resolvedHeadingLevel(): number {
        return Math.min(6, Math.max(1, Math.round(finite(this.headingLevel, 2))))
    }

    expand(originalEvent?: Event): boolean { return this.setExpanded(true, originalEvent) }
    collapse(originalEvent?: Event): boolean { return this.setExpanded(false, originalEvent) }
    toggle(originalEvent?: Event): boolean { return this.setExpanded(!bool(this.expanded), originalEvent) }

    private setExpanded(expanded: boolean, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.expanded) === expanded) return false
        const detail: ExpandableSectionChangeDetail = { expanded, originalEvent }
        if (!this.request('cb-before-expansion-change', detail)) return false
        this.expanded = expanded
        this.syncView()
        this.emit('cb-expansion-change', detail)
        return true
    }
}
