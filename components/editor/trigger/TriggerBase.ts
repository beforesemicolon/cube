import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TriggerProps extends StudioProps {}

/** Headless behavior for the Trigger component. */
export abstract class TriggerBase extends StudioComponentBase<TriggerProps> {
    readonly componentName = 'trigger'
    readonly componentKind: StudioKind = 'select'
}
