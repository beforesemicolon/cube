import { NumericInputBase, type NumericInputProps } from '../NumericInputBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface StepperProps extends NumericInputProps {
    decrementLabel?: string
    incrementLabel?: string
}

/** Headless behavior for the Stepper component. */
export abstract class StepperBase extends NumericInputBase<StepperProps> {
    static observedAttributes = [...NumericInputBase.observedAttributes, 'decrement-label', 'increment-label']
    decrementLabel = ''
    incrementLabel = ''
    readonly componentName = 'stepper'
    readonly componentKind: StudioKind = 'number'
}
