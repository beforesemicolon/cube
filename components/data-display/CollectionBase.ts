import { Component, type ComponentProps } from '../core/Component.js'
import type { StudioItem, StudioValue } from '../studio/types.js'

export interface CollectionProps extends ComponentProps {
    value?: StudioValue
    items?: readonly StudioItem[]
    emptyLabel?: string
    multiple?: boolean
}

/** Item, selection, and empty-state behavior shared by simple collections. */
export abstract class CollectionBase<P extends CollectionProps = CollectionProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'value', 'items', 'empty-label', 'multiple']
    value: StudioValue = ''
    items: readonly StudioItem[] = []
    emptyLabel = ''
    multiple = false
}
