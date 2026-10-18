import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ConflictProps extends StudioProps {}

/** Headless behavior for the Conflict component. */
export abstract class ConflictBase extends StudioComponentBase<ConflictProps> {
    readonly componentName = 'conflict'
    readonly componentKind: StudioKind = 'status'
}
