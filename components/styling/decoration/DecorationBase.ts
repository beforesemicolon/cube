import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DecorationProps extends StudioProps {}

/** Headless behavior for the Decoration component. */
export abstract class DecorationBase extends StudioComponentBase<DecorationProps> {
    readonly componentName = 'decoration'
    readonly componentKind: StudioKind = 'editor'
}
