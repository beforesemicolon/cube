import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SpacingMeasureProps extends StudioProps {}

/** Headless behavior for the Spacing measure component. */
export abstract class SpacingMeasureBase extends StudioComponentBase<SpacingMeasureProps> {
    readonly componentName = 'spacing-measure'
    readonly componentKind: StudioKind = 'canvas'
}
