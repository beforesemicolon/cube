import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface RangeSliderProps extends StudioProps {}

/** Headless behavior for the Range slider component. */
export abstract class RangeSliderBase extends StudioComponentBase<RangeSliderProps> {
    readonly componentName = 'range-slider'
    readonly componentKind: StudioKind = 'range'
}
