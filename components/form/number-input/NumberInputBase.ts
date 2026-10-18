import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface NumberInputProps extends StudioProps {}

/** Headless behavior for the Number input component. */
export abstract class NumberInputBase extends StudioComponentBase<NumberInputProps> {
    readonly componentName = 'number-input'
    readonly componentKind: StudioKind = 'number'
}
