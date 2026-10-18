import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface LayerRowProps extends StudioProps {}

/** Headless behavior for the Layer row component. */
export abstract class LayerRowBase extends StudioComponentBase<LayerRowProps> {
    readonly componentName = 'layer-row'
    readonly componentKind: StudioKind = 'display'
}
