import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface GridTrackProps extends StudioProps {}

/** Headless behavior for the Grid track component. */
export abstract class GridTrackBase extends StudioComponentBase<GridTrackProps> {
    readonly componentName = 'grid-track'
    readonly componentKind: StudioKind = 'tokens'
}
