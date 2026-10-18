import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FilterProps extends StudioProps {}

/** Headless behavior for the Filter component. */
export abstract class FilterBase extends StudioComponentBase<FilterProps> {
    readonly componentName = 'filter'
    readonly componentKind: StudioKind = 'editor'
}
