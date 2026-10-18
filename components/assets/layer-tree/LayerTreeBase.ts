import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface LayerTreeProps extends StudioProps {}

/** Headless behavior for the Layer tree component. */
export abstract class LayerTreeBase extends StudioComponentBase<LayerTreeProps> {
    readonly componentName = 'layer-tree'
    readonly componentKind: StudioKind = 'collection'
}
