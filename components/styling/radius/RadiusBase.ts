import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface RadiusProps extends StudioProps {}

/** Headless behavior for the Radius component. */
export abstract class RadiusBase extends StudioComponentBase<RadiusProps> {
    readonly componentName = 'radius'
    readonly componentKind: StudioKind = 'number'
}
