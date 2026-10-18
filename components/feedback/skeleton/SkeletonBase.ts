import { Component, type CommonProps } from '../../core/Component.js'
import { clamp, finite, scalarText } from '../../core/value.js'

export type SkeletonVariant = 'text' | 'card' | 'table'

export interface SkeletonProps extends CommonProps {
    variant?: SkeletonVariant
    lines?: number
    rows?: number
    columns?: number
    animated?: boolean
    accessibleLabel?: string
}

/** Placeholder structure and accessibility policy without prescribing its renderer. */
export abstract class SkeletonBase<P extends SkeletonProps = SkeletonProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'variant', 'lines', 'rows', 'columns', 'animated', 'accessible-label']
    variant: SkeletonVariant = 'text'
    lines = 3
    rows = 3
    columns = 3
    animated = true
    accessibleLabel = ''

    protected abstract syncView(): void
    protected mount(): void { this.syncView() }
    protected update(): void { this.syncView() }
    protected count(value: number, fallback: number): number { return Math.round(clamp(finite(value, fallback), 1, 12)) }
    protected normalizedVariant(): SkeletonVariant { return ['text', 'card', 'table'].includes(this.variant) ? this.variant : 'text' }
    protected loadingLabel(): string { return scalarText(this.accessibleLabel) }
}
