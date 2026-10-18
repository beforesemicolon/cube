import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PanProps extends StudioProps {}

/** Headless behavior for the Pan component. */
export abstract class PanBase extends StudioComponentBase<PanProps> {
    readonly componentName = 'pan'
    readonly componentKind: StudioKind = 'canvas'
}
