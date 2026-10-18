import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface HiddenIndicatorProps extends StudioProps {}

/** Headless behavior for the Hidden indicator component. */
export abstract class HiddenIndicatorBase extends StudioComponentBase<HiddenIndicatorProps> {
    readonly componentName = 'hidden-indicator'
    readonly componentKind: StudioKind = 'canvas'
}
