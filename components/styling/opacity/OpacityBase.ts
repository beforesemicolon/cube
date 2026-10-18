import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface OpacityProps extends StudioProps {}

/** Headless behavior for the Opacity component. */
export abstract class OpacityBase extends StudioComponentBase<OpacityProps> {
    readonly componentName = 'opacity'
    readonly componentKind: StudioKind = 'range'
}
