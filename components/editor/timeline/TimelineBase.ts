import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TimelineProps extends StudioProps {}

/** Headless behavior for the Timeline component. */
export abstract class TimelineBase extends StudioComponentBase<TimelineProps> {
    readonly componentName = 'timeline'
    readonly componentKind: StudioKind = 'canvas'
}
