import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'

export interface PropertyGroupProps extends ComponentProps {
    expanded?: boolean
    collapsible?: boolean
    dirty?: boolean
    mixed?: boolean
    resetLabel?: string
    mixedLabel?: string
    expandLabel?: string
    collapseLabel?: string
}

/** Inspector group disclosure and reset behavior, independent from its property controls. */
export abstract class PropertyGroupBase<P extends PropertyGroupProps = PropertyGroupProps> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes, 'expanded', 'collapsible', 'dirty', 'mixed', 'reset-label', 'mixed-label', 'expand-label', 'collapse-label',
    ]
    expanded = true
    collapsible = true
    dirty = false
    mixed = false
    resetLabel = ''
    mixedLabel = ''
    expandLabel = ''
    collapseLabel = ''

    toggle(originalEvent?: Event): boolean {
        if (!bool(this.collapsible) || this.unavailable) return false
        const expanded = !bool(this.expanded)
        const detail = { expanded, originalEvent }
        if (!this.request('beforeexpansionchange', detail)) return false
        this.expanded = expanded
        this.syncView()
        this.emit('expansionchange', detail)
        return true
    }
    reset(originalEvent?: Event): boolean {
        if (!bool(this.dirty) || this.unavailable) return false
        const detail = { originalEvent }
        if (!this.request('beforereset', detail)) return false
        this.emit('reset', detail)
        return true
    }
    protected toggleLabel(): string { return scalarText(bool(this.expanded) ? this.collapseLabel : this.expandLabel) }
}
