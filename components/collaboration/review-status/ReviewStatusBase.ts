import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ReviewStatusProps extends StudioProps {}

/** Headless behavior for the Review status component. */
export abstract class ReviewStatusBase extends StudioComponentBase<ReviewStatusProps> {
    readonly componentName = 'review-status'
    readonly componentKind: StudioKind = 'status'
}
