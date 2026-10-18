import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PositionProps extends StudioProps {}

/** Headless behavior for the Position component. */
export abstract class PositionBase extends StudioComponentBase<PositionProps> {
    readonly componentName = 'position'
    readonly componentKind: StudioKind = 'select'
}
