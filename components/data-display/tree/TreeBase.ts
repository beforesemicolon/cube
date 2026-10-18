import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TreeProps extends StudioProps {}

/** Headless behavior for the Tree component. */
export abstract class TreeBase extends StudioComponentBase<TreeProps> {
    readonly componentName = 'tree'
    readonly componentKind: StudioKind = 'collection'
}
