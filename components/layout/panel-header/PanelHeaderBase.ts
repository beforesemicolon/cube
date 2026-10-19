import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'

export interface PanelHeaderProps extends ComponentProps {
    collapsible?: boolean
    expanded?: boolean
    expandLabel?: string
    collapseLabel?: string
}

/** Disclosure behavior for a panel heading, independent from its renderer. */
export abstract class PanelHeaderBase<P extends PanelHeaderProps = PanelHeaderProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'collapsible', 'expanded', 'expand-label', 'collapse-label']
    collapsible = false
    expanded = true
    expandLabel = ''
    collapseLabel = ''

    protected isExpanded(): boolean { return bool(this.expanded) }
    protected isCollapsible = (): boolean => { return bool(this.collapsible) }

    protected toggleExpanded = (originalEvent?: Event): boolean => {
        if (!this.isCollapsible() || this.unavailable) return false
        const expanded = !this.isExpanded()
        const detail = { expanded, originalEvent }
        if (!this.request('beforetoggle', detail)) return false
        this.expanded = expanded
        this.toggleAttribute('expanded', expanded)
        this.syncView()
        this.emit('toggle', detail)
        return true
    }

    protected toggleText = (): string => {
        return scalarText(this.isExpanded() ? this.collapseLabel : this.expandLabel)
    }
}
