import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PseudoStateProps extends StudioProps {}

/** Headless behavior for the Pseudo state component. */
export abstract class PseudoStateBase extends StudioComponentBase<PseudoStateProps> {
    readonly componentName = 'pseudo-state'
    readonly componentKind: StudioKind = 'select'
}
