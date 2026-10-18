import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ConditionalVisibilityProps extends StudioProps {}

/** Headless behavior for the Conditional visibility component. */
export abstract class ConditionalVisibilityBase extends StudioComponentBase<ConditionalVisibilityProps> {
    readonly componentName = 'conditional-visibility'
    readonly componentKind: StudioKind = 'editor'
}
