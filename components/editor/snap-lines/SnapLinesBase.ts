import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SnapLinesProps extends StudioProps {}

/** Headless behavior for the Snap lines component. */
export abstract class SnapLinesBase extends StudioComponentBase<SnapLinesProps> {
    readonly componentName = 'snap-lines'
    readonly componentKind: StudioKind = 'canvas'
}
