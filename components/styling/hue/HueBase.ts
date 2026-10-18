import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface HueProps extends StudioProps {}

/** Headless behavior for the Hue component. */
export abstract class HueBase extends StudioComponentBase<HueProps> {
    readonly componentName = 'hue'
    readonly componentKind: StudioKind = 'range'
}
