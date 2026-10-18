import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ArtboardProps extends StudioProps {}

/** Headless behavior for the Artboard component. */
export abstract class ArtboardBase extends StudioComponentBase<ArtboardProps> {
    readonly componentName = 'artboard'
    readonly componentKind: StudioKind = 'canvas'
}
