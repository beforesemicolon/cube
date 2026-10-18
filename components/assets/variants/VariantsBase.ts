import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface VariantsProps extends StudioProps {}

/** Headless behavior for the Variants component. */
export abstract class VariantsBase extends StudioComponentBase<VariantsProps> {
    readonly componentName = 'variants'
    readonly componentKind: StudioKind = 'collection'
}
