import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface StatProps extends StudioProps {}

/** Headless behavior for the Stat component. */
export abstract class StatBase extends StudioComponentBase<StatProps> {
    readonly componentName = 'stat'
    readonly componentKind: StudioKind = 'status'
}
