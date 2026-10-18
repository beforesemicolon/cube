import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FillProps extends StudioProps {}

/** Headless behavior for the Fill component. */
export abstract class FillBase extends StudioComponentBase<FillProps> {
    readonly componentName = 'fill'
    readonly componentKind: StudioKind = 'color'
}
