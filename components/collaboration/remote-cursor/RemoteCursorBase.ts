import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface RemoteCursorProps extends StudioProps {}

/** Headless behavior for the Remote cursor component. */
export abstract class RemoteCursorBase extends StudioComponentBase<RemoteCursorProps> {
    readonly componentName = 'remote-cursor'
    readonly componentKind: StudioKind = 'canvas'
}
