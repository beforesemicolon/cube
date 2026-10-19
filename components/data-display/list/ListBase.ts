import { CollectionBase, type CollectionProps } from '../CollectionBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface ListProps extends CollectionProps {}

/** Headless behavior for the List component. */
export abstract class ListBase extends CollectionBase<ListProps> {
    readonly componentName = 'list'
    readonly componentKind: StudioKind = 'collection'
}
