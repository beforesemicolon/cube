import { Component, type ComponentProps, type ControlSize } from '../../core/Component.js'

export type HeadingVariant = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export interface HeadingProps extends ComponentProps { variant?: HeadingVariant }

/** Semantic heading behavior shared by heading renderers. */
export abstract class HeadingBase<P extends HeadingProps = HeadingProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'variant']
    variant: HeadingVariant = 'h2'
    size: ControlSize = 'lg'
}
