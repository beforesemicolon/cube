import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ValidationProps extends StudioProps {}

/** Headless behavior for the Validation component. */
export abstract class ValidationBase extends StudioComponentBase<ValidationProps> {
    readonly componentName = 'validation'
    readonly componentKind: StudioKind = 'status'
}
