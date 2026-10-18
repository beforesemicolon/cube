import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface RulersProps extends StudioProps {}

/** Headless behavior for the Rulers component. */
export abstract class RulersBase extends StudioComponentBase<RulersProps> {
    readonly componentName = 'rulers'
    readonly componentKind: StudioKind = 'canvas'
}
