import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface StrokeProps extends StudioProps {}

/** Headless behavior for the Stroke component. */
export abstract class StrokeBase extends StudioComponentBase<StrokeProps> {
    readonly componentName = 'stroke'
    readonly componentKind: StudioKind = 'color'
}
