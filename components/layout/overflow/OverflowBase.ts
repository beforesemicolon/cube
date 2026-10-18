import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface OverflowProps extends StudioProps {}

/** Headless behavior for the Overflow component. */
export abstract class OverflowBase extends StudioComponentBase<OverflowProps> {
    readonly componentName = 'overflow'
    readonly componentKind: StudioKind = 'select'
}
