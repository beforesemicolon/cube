import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface BreakpointsProps extends StudioProps {}

/** Headless behavior for the Breakpoints component. */
export abstract class BreakpointsBase extends StudioComponentBase<BreakpointsProps> {
    readonly componentName = 'breakpoints'
    readonly componentKind: StudioKind = 'tokens'
}
