import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ViewportProps extends StudioProps {}

/** Headless behavior for the Viewport component. */
export abstract class ViewportBase extends StudioComponentBase<ViewportProps> {
    readonly componentName = 'viewport'
    readonly componentKind: StudioKind = 'canvas'
}
