import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PresenceProps extends StudioProps {}

/** Headless behavior for the Presence component. */
export abstract class PresenceBase extends StudioComponentBase<PresenceProps> {
    readonly componentName = 'presence'
    readonly componentKind: StudioKind = 'collaboration'
}
