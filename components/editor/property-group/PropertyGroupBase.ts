import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool, scalarText } from '../../core/value.js'

export interface PropertyGroupProps extends UIProps {
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
export abstract class PropertyGroupBase<P extends PropertyGroupProps = PropertyGroupProps> extends UIComponent<P> {
    static observedAttributes = [
        ...UIComponent.observedAttributes, 'expanded', 'collapsible', 'dirty', 'mixed', 'reset-label', 'mixed-label', 'expand-label', 'collapse-label',
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
        if (!this.request('cb-before-expansion-change', detail)) return false
        this.expanded = expanded
        this.syncView()
        this.emit('cb-expansion-change', detail)
        return true
    }
    reset(originalEvent?: Event): boolean {
        if (!bool(this.dirty) || this.unavailable) return false
        const detail = { originalEvent }
        if (!this.request('cb-before-reset', detail)) return false
        this.emit('cb-reset', detail)
        return true
    }
    protected toggleLabel(): string { return scalarText(bool(this.expanded) ? this.collapseLabel : this.expandLabel) }
}
