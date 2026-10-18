import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface StatusProps extends StudioProps {}

/** Headless behavior for the Status component. */
export abstract class StatusBase extends StudioComponentBase<StatusProps> {
    readonly componentName = 'status'
    readonly componentKind: StudioKind = 'status'
}
