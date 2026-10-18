import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool, scalarText } from '../../core/value.js'

export interface PanelHeaderProps extends UIProps {
    collapsible?: boolean
    expanded?: boolean
    expandLabel?: string
    collapseLabel?: string
}

/** Disclosure behavior for a panel heading, independent from its renderer. */
export abstract class PanelHeaderBase<P extends PanelHeaderProps = PanelHeaderProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'collapsible', 'expanded', 'expand-label', 'collapse-label']
    collapsible = false
    expanded = true
    expandLabel = ''
    collapseLabel = ''

    protected isExpanded(): boolean { return this.hasAttribute('expanded') || bool(this.expanded) }
    protected isCollapsible(): boolean { return this.hasAttribute('collapsible') || bool(this.collapsible) }

    protected toggleExpanded(originalEvent?: Event): boolean {
        if (!this.isCollapsible() || this.unavailable) return false
        const expanded = !this.isExpanded()
        const detail = { expanded, originalEvent }
        if (!this.request('cb-before-toggle', detail)) return false
        this.expanded = expanded
        this.toggleAttribute('expanded', expanded)
        this.syncView()
        this.emit('cb-toggle', detail)
        return true
    }

    protected toggleText(): string {
        return scalarText(this.isExpanded() ? this.collapseLabel : this.expandLabel)
    }
}
