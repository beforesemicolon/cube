import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface LinkedDimensionProps extends StudioProps {}

/** Headless behavior for the Linked dimension component. */
export abstract class LinkedDimensionBase extends StudioComponentBase<LinkedDimensionProps> {
    readonly componentName = 'linked-dimension'
    readonly componentKind: StudioKind = 'editor'
}
