import { CollectionBase, type CollectionProps } from '../CollectionBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface TreeProps extends CollectionProps {}

/** Headless behavior for the Tree component. */
export abstract class TreeBase extends CollectionBase<TreeProps> {
    readonly componentName = 'tree'
    readonly componentKind: StudioKind = 'collection'
}
