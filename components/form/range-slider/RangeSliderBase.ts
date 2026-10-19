import { NumericInputBase, type NumericInputProps } from '../NumericInputBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface RangeSliderProps extends NumericInputProps {}

/** Headless behavior for the Range slider component. */
export abstract class RangeSliderBase extends NumericInputBase<RangeSliderProps> {
    readonly componentName = 'range-slider'
    readonly componentKind: StudioKind = 'range'
}
