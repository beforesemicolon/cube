import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool, scalarText } from '../../core/value.js'

export interface CollapsibleSidebarProps extends UIProps {
    expanded?: boolean
    placement?: 'start' | 'end'
    expandLabel?: string
    collapseLabel?: string
}

/** Collapsible sidebar state without prescribing its rendered navigation. */
export abstract class CollapsibleSidebarBase<P extends CollapsibleSidebarProps = CollapsibleSidebarProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'expanded', 'placement', 'expand-label', 'collapse-label']
    expanded = true
    placement: 'start' | 'end' = 'start'
    expandLabel = ''
    collapseLabel = ''

    protected isExpanded(): boolean { return this.hasAttribute('expanded') || bool(this.expanded) }

    toggle(originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const expanded = !this.isExpanded()
        const detail = { expanded, originalEvent }
        if (!this.request('cb-before-toggle', detail)) return false
        this.expanded = expanded
        this.toggleAttribute('expanded', expanded)
        this.syncView()
        this.emit('cb-toggle', detail)
        return true
    }

    protected toggleText(): string { return scalarText(this.isExpanded() ? this.collapseLabel : this.expandLabel) }
}
