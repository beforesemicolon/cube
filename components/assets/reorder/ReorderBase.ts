import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ReorderProps extends StudioProps {}

/** Headless behavior for the Reorder component. */
export abstract class ReorderBase extends StudioComponentBase<ReorderProps> {
    readonly componentName = 'reorder'
    readonly componentKind: StudioKind = 'collection'
}
