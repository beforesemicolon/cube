import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface HoverOutlineProps extends StudioProps {}

/** Headless behavior for the Hover outline component. */
export abstract class HoverOutlineBase extends StudioComponentBase<HoverOutlineProps> {
    readonly componentName = 'hover-outline'
    readonly componentKind: StudioKind = 'canvas'
}
