import { MessageBase, type MessageProps } from '../MessageBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface EmptyStateProps extends MessageProps {}

/** Headless behavior for the Empty state component. */
export abstract class EmptyStateBase extends MessageBase<EmptyStateProps> {
    readonly componentName = 'empty-state'
    readonly componentKind: StudioKind = 'status'
}
