import { ChoiceControlBase, type ChoiceControlProps } from '../ChoiceControlBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface CheckboxProps extends ChoiceControlProps {}

/** Headless behavior for the Checkbox component. */
export abstract class CheckboxBase extends ChoiceControlBase<CheckboxProps> {
    readonly componentName = 'checkbox'
    readonly componentKind: StudioKind = 'choice'
}
