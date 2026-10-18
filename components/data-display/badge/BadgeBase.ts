import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface BadgeProps extends StudioProps {}

/** Headless behavior for the Badge component. */
export abstract class BadgeBase extends StudioComponentBase<BadgeProps> {
    readonly componentName = 'badge'
    readonly componentKind: StudioKind = 'display'
}
