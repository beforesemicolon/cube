import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface InstanceIndicatorProps extends StudioProps {}

/** Headless behavior for the Instance indicator component. */
export abstract class InstanceIndicatorBase extends StudioComponentBase<InstanceIndicatorProps> {
    readonly componentName = 'instance-indicator'
    readonly componentKind: StudioKind = 'status'
}
