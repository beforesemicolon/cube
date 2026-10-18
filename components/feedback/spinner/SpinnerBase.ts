import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SpinnerProps extends StudioProps {}

/** Headless behavior for the Spinner component. */
export abstract class SpinnerBase extends StudioComponentBase<SpinnerProps> {
    readonly componentName = 'spinner'
    readonly componentKind: StudioKind = 'progress'
}
