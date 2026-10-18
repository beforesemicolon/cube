import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ShadowProps extends StudioProps {}

/** Headless behavior for the Shadow component. */
export abstract class ShadowBase extends StudioComponentBase<ShadowProps> {
    readonly componentName = 'shadow'
    readonly componentKind: StudioKind = 'editor'
}
