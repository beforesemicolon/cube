import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface LockOverlayProps extends StudioProps {}

/** Headless behavior for the Lock overlay component. */
export abstract class LockOverlayBase extends StudioComponentBase<LockOverlayProps> {
    readonly componentName = 'lock-overlay'
    readonly componentKind: StudioKind = 'canvas'
}
