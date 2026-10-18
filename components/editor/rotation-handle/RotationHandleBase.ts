import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface RotationHandleProps extends StudioProps {}

/** Headless behavior for the Rotation handle component. */
export abstract class RotationHandleBase extends StudioComponentBase<RotationHandleProps> {
    readonly componentName = 'rotation-handle'
    readonly componentKind: StudioKind = 'canvas'
}
