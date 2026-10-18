import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface StepperProps extends StudioProps {
    decrementLabel?: string
    incrementLabel?: string
}

/** Headless behavior for the Stepper component. */
export abstract class StepperBase extends StudioComponentBase<StepperProps> {
    static observedAttributes = [...StudioComponentBase.observedAttributes, 'decrement-label', 'increment-label']
    decrementLabel = ''
    incrementLabel = ''
    readonly componentName = 'stepper'
    readonly componentKind: StudioKind = 'number'
}
