import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface CanvasMenuProps extends StudioProps {}

/** Headless behavior for the Canvas menu component. */
export abstract class CanvasMenuBase extends StudioComponentBase<CanvasMenuProps> {
    readonly componentName = 'canvas-menu'
    readonly componentKind: StudioKind = 'collection'
}
