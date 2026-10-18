import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ProgressProps extends StudioProps {}

/** Headless behavior for the Progress component. */
export abstract class ProgressBase extends StudioComponentBase<ProgressProps> {
    readonly componentName = 'progress'
    readonly componentKind: StudioKind = 'progress'
}
