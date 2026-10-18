import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface CursorProps extends StudioProps {}

/** Headless behavior for the Cursor component. */
export abstract class CursorBase extends StudioComponentBase<CursorProps> {
    readonly componentName = 'cursor'
    readonly componentKind: StudioKind = 'canvas'
}
