import { NumericInputBase, type NumericInputProps } from '../NumericInputBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface NumberInputProps extends NumericInputProps {}

/** Headless behavior for the Number input component. */
export abstract class NumberInputBase extends NumericInputBase<NumberInputProps> {
    readonly componentName = 'number-input'
    readonly componentKind: StudioKind = 'number'
}
