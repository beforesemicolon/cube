import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SizingModeProps extends StudioProps {}

/** Headless behavior for the Sizing mode component. */
export abstract class SizingModeBase extends StudioComponentBase<SizingModeProps> {
    readonly componentName = 'sizing-mode'
    readonly componentKind: StudioKind = 'collection'
}
