import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface EmptyStateProps extends StudioProps {}

/** Headless behavior for the Empty state component. */
export abstract class EmptyStateBase extends StudioComponentBase<EmptyStateProps> {
    readonly componentName = 'empty-state'
    readonly componentKind: StudioKind = 'status'
}
