import { Component, type ComponentProps } from '../../core/Component.js'
import type { StudioKind } from '../../studio/types.js'

export interface EmptyStateProps extends ComponentProps { heading: string; icon: string; iconSrc?: string }

/** Headless behavior for the Empty state component. */
export abstract class EmptyStateBase extends Component<EmptyStateProps> {
    static observedAttributes = [...Component.observedAttributes, 'heading', 'icon', 'icon-src']
    heading = ''
    icon = 'plus'
    iconSrc = ''
    readonly componentName = 'empty-state'
    readonly componentKind: StudioKind = 'status'
}
