import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface VariableBindingProps extends StudioProps {}

/** Headless behavior for the Variable binding component. */
export abstract class VariableBindingBase extends StudioComponentBase<VariableBindingProps> {
    readonly componentName = 'variable-binding'
    readonly componentKind: StudioKind = 'select'
}
