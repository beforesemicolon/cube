import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'

export interface SidebarProps extends ComponentProps {
    collapsible?: boolean
    expanded?: boolean
    placement?: 'start' | 'end'
    expandLabel?: string
    collapseLabel?: string
}

/** Sidebar disclosure behavior without prescribing its rendered navigation. */
export abstract class SidebarBase<
    P extends SidebarProps = SidebarProps,
> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'collapsible',
        'expanded',
        'placement',
        'expand-label',
        'collapse-label',
    ]
    collapsible = false
    expanded = true
    placement: 'start' | 'end' = 'start'
    expandLabel = ''
    collapseLabel = ''

    protected isCollapsible = (): boolean => {
        return bool(this.collapsible)
    }
    protected isExpanded = (): boolean => {
        return !this.isCollapsible() || bool(this.expanded)
    }

    toggle(originalEvent?: Event): boolean {
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

    protected toggleText(): string {
        return scalarText(
            this.isExpanded() ? this.collapseLabel : this.expandLabel
        )
    }
}
