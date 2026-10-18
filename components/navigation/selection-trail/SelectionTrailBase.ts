import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SelectionTrailProps extends StudioProps {}

/** Headless behavior for the Selection trail component. */
export abstract class SelectionTrailBase extends StudioComponentBase<SelectionTrailProps> {
    readonly componentName = 'selection-trail'
    readonly componentKind: StudioKind = 'collection'
}
