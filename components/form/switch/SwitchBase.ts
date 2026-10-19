import { ChoiceControlBase, type ChoiceControlProps } from '../ChoiceControlBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface SwitchProps extends ChoiceControlProps {}

/** Headless behavior for the Switch component. */
export abstract class SwitchBase extends ChoiceControlBase<SwitchProps> {
    readonly componentName = 'switch'
    readonly componentKind: StudioKind = 'choice'
}
