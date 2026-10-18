import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ResizeHandleProps extends StudioProps {}

/** Headless behavior for the Resize handle component. */
export abstract class ResizeHandleBase extends StudioComponentBase<ResizeHandleProps> {
    readonly componentName = 'resize-handle'
    readonly componentKind: StudioKind = 'canvas'
}
