import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SpacingProps extends StudioProps {}

/** Headless behavior for the Spacing component. */
export abstract class SpacingBase extends StudioComponentBase<SpacingProps> {
    readonly componentName = 'spacing'
    readonly componentKind: StudioKind = 'number'
}
