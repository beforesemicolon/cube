import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DropIndicatorProps extends StudioProps {}

/** Headless behavior for the Drop indicator component. */
export abstract class DropIndicatorBase extends StudioComponentBase<DropIndicatorProps> {
    readonly componentName = 'drop-indicator'
    readonly componentKind: StudioKind = 'canvas'
}
