import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AcceptRejectProps extends StudioProps {}

/** Headless behavior for the Accept reject component. */
export abstract class AcceptRejectBase extends StudioComponentBase<AcceptRejectProps> {
    readonly componentName = 'accept-reject'
    readonly componentKind: StudioKind = 'editor'
}
