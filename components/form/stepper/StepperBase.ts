import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface StepperProps extends StudioProps {}

/** Headless behavior for the Stepper component. */
export abstract class StepperBase extends StudioComponentBase<StepperProps> {
    readonly componentName = 'stepper'
    readonly componentKind: StudioKind = 'number'
}
