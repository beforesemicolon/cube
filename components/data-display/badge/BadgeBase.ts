import { Component, type ComponentProps } from '../../core/Component.js'
import type { StudioKind, StudioValue } from '../../studio/types.js'

export interface BadgeProps extends ComponentProps { value?: StudioValue }

/** Headless behavior for the Badge component. */
export abstract class BadgeBase extends Component<BadgeProps> {
    static observedAttributes = [...Component.observedAttributes, 'value']
    value: StudioValue = ''
    readonly componentName = 'badge'
    readonly componentKind: StudioKind = 'display'
}
