import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface BreakpointNavigatorProps extends StudioProps {}

/** Headless behavior for the Breakpoint navigator component. */
export abstract class BreakpointNavigatorBase extends StudioComponentBase<BreakpointNavigatorProps> {
    readonly componentName = 'breakpoint-navigator'
    readonly componentKind: StudioKind = 'collection'
}
