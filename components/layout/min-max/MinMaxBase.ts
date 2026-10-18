import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface MinMaxProps extends StudioProps {}

/** Headless behavior for the Min max component. */
export abstract class MinMaxBase extends StudioComponentBase<MinMaxProps> {
    readonly componentName = 'min-max'
    readonly componentKind: StudioKind = 'editor'
}
