import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ConstraintsProps extends StudioProps {}

/** Headless behavior for the Constraints component. */
export abstract class ConstraintsBase extends StudioComponentBase<ConstraintsProps> {
    readonly componentName = 'constraints'
    readonly componentKind: StudioKind = 'collection'
}
