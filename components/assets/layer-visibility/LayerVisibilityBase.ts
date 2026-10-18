import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface LayerVisibilityProps extends StudioProps {}

/** Headless behavior for the Visibility component. */
export abstract class LayerVisibilityBase extends StudioComponentBase<LayerVisibilityProps> {
    readonly componentName = 'layer-visibility'
    readonly componentKind: StudioKind = 'choice'
}
