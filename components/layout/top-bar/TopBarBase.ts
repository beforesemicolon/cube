import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface TopBarProps extends StudioProps {}

/** Headless behavior for the Top bar component. */
export abstract class TopBarBase extends StudioComponentBase<TopBarProps> {
    readonly componentName = 'top-bar'
    readonly componentKind: StudioKind = 'shell'
}
