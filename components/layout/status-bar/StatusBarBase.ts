import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface StatusBarProps extends StudioProps {}

/** Headless behavior for the Status bar component. */
export abstract class StatusBarBase extends StudioComponentBase<StatusBarProps> {
    readonly componentName = 'status-bar'
    readonly componentKind: StudioKind = 'shell'
}
