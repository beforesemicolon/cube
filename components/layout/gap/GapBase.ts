import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface GapProps extends StudioProps {}

/** Headless behavior for the Gap component. */
export abstract class GapBase extends StudioComponentBase<GapProps> {
    readonly componentName = 'gap'
    readonly componentKind: StudioKind = 'number'
}
