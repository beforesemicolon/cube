import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface RotationProps extends StudioProps {}

/** Headless behavior for the Rotation component. */
export abstract class RotationBase extends StudioComponentBase<RotationProps> {
    readonly componentName = 'rotation'
    readonly componentKind: StudioKind = 'range'
}
