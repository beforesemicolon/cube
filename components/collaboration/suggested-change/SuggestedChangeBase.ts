import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SuggestedChangeProps extends StudioProps {}

/** Headless behavior for the Suggested change component. */
export abstract class SuggestedChangeBase extends StudioComponentBase<SuggestedChangeProps> {
    readonly componentName = 'suggested-change'
    readonly componentKind: StudioKind = 'collaboration'
}
