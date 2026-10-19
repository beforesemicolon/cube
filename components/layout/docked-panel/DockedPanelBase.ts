import { Component, type ComponentProps } from '../../core/Component.js'
import { bool } from '../../core/value.js'

export interface DockedPanelProps extends ComponentProps {
    expanded?: boolean
    collapsible?: boolean
    placement?: 'start' | 'end' | 'bottom'
    expandLabel?: string
    collapseLabel?: string
}

/** Docked panel disclosure behavior without prescribing its contents. */
export abstract class DockedPanelBase<P extends DockedPanelProps = DockedPanelProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'expanded', 'collapsible', 'placement', 'expand-label', 'collapse-label']
    expanded = true
    collapsible = true
    placement: 'start' | 'end' | 'bottom' = 'end'
    expandLabel = ''
    collapseLabel = ''
    protected isExpanded(): boolean { return bool(this.expanded) }
    protected isCollapsible(): boolean { return bool(this.collapsible) }
    protected togglePanel(originalEvent?: Event): boolean {
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
}
