import { Component, type CommonProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'

export type DividerLabelPosition = 'start' | 'center' | 'end'
export type DividerVariant = 'solid' | 'dotted' | 'dashed' | 'double'
export interface DividerProps extends CommonProps {
    stacked?: boolean
    decorative?: boolean
    labelPosition?: DividerLabelPosition
    variant?: DividerVariant
}

/** Divider semantics independent of its visual renderer. */
export abstract class DividerBase<P extends DividerProps = DividerProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'stacked', 'decorative', 'label-position', 'variant']
    stacked = false
    decorative = false
    labelPosition: DividerLabelPosition = 'start'
    variant: DividerVariant = 'solid'
    protected hasLabel = (): boolean => Boolean(scalarText(this.label).trim())
    protected resolvedLabelPosition = (): DividerLabelPosition =>
        ['start', 'center', 'end'].includes(this.labelPosition) ? this.labelPosition : 'start'
    protected resolvedVariant = (): DividerVariant =>
        ['solid', 'dotted', 'dashed', 'double'].includes(this.variant) ? this.variant : 'solid'

    protected syncDivider(): void {
        const orientation = bool(this.stacked) ? 'vertical' : 'horizontal'
        this.toggleAttribute('data-stacked', bool(this.stacked))
        if (bool(this.decorative)) {
            this.setAttribute('role', 'presentation')
            this.removeAttribute('aria-orientation')
            this.removeAttribute('aria-label')
        } else {
            this.setAttribute('role', 'separator')
            this.setAttribute('aria-orientation', orientation)
            const name = scalarText(this.accessibleLabel).trim() || scalarText(this.label).trim()
            if (name) this.setAttribute('aria-label', name)
            else this.removeAttribute('aria-label')
        }
    }

    protected mount(): void { this.syncDivider() }
    protected update(): void { this.syncDivider() }
}
