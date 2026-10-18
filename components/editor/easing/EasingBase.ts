import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface EasingProps extends StudioProps {}

/** Headless behavior for the Easing component. */
export abstract class EasingBase extends StudioComponentBase<EasingProps> {
    readonly componentName = 'easing'
    readonly componentKind: StudioKind = 'select'
}
