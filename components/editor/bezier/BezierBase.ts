import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface BezierProps extends StudioProps {}

/** Headless behavior for the Bezier component. */
export abstract class BezierBase extends StudioComponentBase<BezierProps> {
    readonly componentName = 'bezier'
    readonly componentKind: StudioKind = 'canvas'
}
