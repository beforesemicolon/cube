import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface UnitInputProps extends StudioProps {}

/** Headless behavior for the Unit input component. */
export abstract class UnitInputBase extends StudioComponentBase<UnitInputProps> {
    readonly componentName = 'unit-input'
    readonly componentKind: StudioKind = 'number'
}
