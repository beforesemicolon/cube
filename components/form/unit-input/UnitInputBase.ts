import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface UnitInputProps extends StudioProps {
    unitLabel?: string
}

/** Headless behavior for the Unit input component. */
export abstract class UnitInputBase extends StudioComponentBase<UnitInputProps> {
    static observedAttributes = [...StudioComponentBase.observedAttributes, 'unit-label']
    unitLabel = ''
    readonly componentName = 'unit-input'
    readonly componentKind: StudioKind = 'number'
}
