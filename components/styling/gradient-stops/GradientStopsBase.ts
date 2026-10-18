import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface GradientStopsProps extends StudioProps {}

/** Headless behavior for the Gradient stops component. */
export abstract class GradientStopsBase extends StudioComponentBase<GradientStopsProps> {
    readonly componentName = 'gradient-stops'
    readonly componentKind: StudioKind = 'tokens'
}
