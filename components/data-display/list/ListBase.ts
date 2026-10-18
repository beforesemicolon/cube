import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ListProps extends StudioProps {}

/** Headless behavior for the List component. */
export abstract class ListBase extends StudioComponentBase<ListProps> {
    readonly componentName = 'list'
    readonly componentKind: StudioKind = 'collection'
}
