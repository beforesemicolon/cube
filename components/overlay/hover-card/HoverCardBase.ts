import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface HoverCardProps extends StudioProps {}

/** Headless behavior for the Hover card component. */
export abstract class HoverCardBase extends StudioComponentBase<HoverCardProps> {
    readonly componentName = 'hover-card'
    readonly componentKind: StudioKind = 'panel'
}
