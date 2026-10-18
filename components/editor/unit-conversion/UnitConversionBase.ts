import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface UnitConversionProps extends StudioProps {}

/** Headless behavior for the Unit conversion component. */
export abstract class UnitConversionBase extends StudioComponentBase<UnitConversionProps> {
    readonly componentName = 'unit-conversion'
    readonly componentKind: StudioKind = 'editor'
}
