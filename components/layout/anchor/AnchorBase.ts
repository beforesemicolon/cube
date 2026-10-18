import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AnchorProps extends StudioProps {}

/** Headless behavior for the Anchor component. */
export abstract class AnchorBase extends StudioComponentBase<AnchorProps> {
    readonly componentName = 'anchor'
    readonly componentKind: StudioKind = 'collection'
}
