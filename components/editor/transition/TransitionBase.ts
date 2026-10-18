import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TransitionProps extends StudioProps {}

/** Headless behavior for the Transition component. */
export abstract class TransitionBase extends StudioComponentBase<TransitionProps> {
    readonly componentName = 'transition'
    readonly componentKind: StudioKind = 'editor'
}
