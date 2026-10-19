import { Component, type ComponentProps } from '../../core/Component.js'
import type { StudioItem, StudioKind, StudioValue } from '../../studio/types.js'

export interface CardProps extends ComponentProps {
    value?: StudioValue
    items?: readonly StudioItem[]
    actionLabel?: string
}

/** Headless behavior for the Card component. */
export abstract class CardBase extends Component<CardProps> {
    static observedAttributes = [...Component.observedAttributes, 'value', 'items', 'action-label']
    value: StudioValue = ''
    items: readonly StudioItem[] = []
    actionLabel = ''
    readonly componentName = 'card'
    readonly componentKind: StudioKind = 'panel'
}
