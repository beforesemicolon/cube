import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface GridOverlayProps extends StudioProps {}

/** Headless behavior for the Grid overlay component. */
export abstract class GridOverlayBase extends StudioComponentBase<GridOverlayProps> {
    readonly componentName = 'grid-overlay'
    readonly componentKind: StudioKind = 'canvas'
}
