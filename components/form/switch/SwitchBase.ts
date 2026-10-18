import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SwitchProps extends StudioProps {}

/** Headless behavior for the Switch component. */
export abstract class SwitchBase extends StudioComponentBase<SwitchProps> {
    readonly componentName = 'switch'
    readonly componentKind: StudioKind = 'choice'
}
