import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface MarqueeProps extends StudioProps {}

/** Headless behavior for the Marquee component. */
export abstract class MarqueeBase extends StudioComponentBase<MarqueeProps> {
    readonly componentName = 'marquee'
    readonly componentKind: StudioKind = 'canvas'
}
