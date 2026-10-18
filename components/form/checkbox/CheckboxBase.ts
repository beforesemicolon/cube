import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface CheckboxProps extends StudioProps {}

/** Headless behavior for the Checkbox component. */
export abstract class CheckboxBase extends StudioComponentBase<CheckboxProps> {
    readonly componentName = 'checkbox'
    readonly componentKind: StudioKind = 'choice'
}
