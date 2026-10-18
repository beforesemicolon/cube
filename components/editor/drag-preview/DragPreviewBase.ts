import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DragPreviewProps extends StudioProps {}

/** Headless behavior for the Drag preview component. */
export abstract class DragPreviewBase extends StudioComponentBase<DragPreviewProps> {
    readonly componentName = 'drag-preview'
    readonly componentKind: StudioKind = 'canvas'
}
