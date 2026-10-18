import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface GridEditorProps extends StudioProps {}

/** Headless behavior for the Grid editor component. */
export abstract class GridEditorBase extends StudioComponentBase<GridEditorProps> {
    readonly componentName = 'grid-editor'
    readonly componentKind: StudioKind = 'editor'
}
