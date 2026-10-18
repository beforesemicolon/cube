import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface CommentPinProps extends StudioProps {}

/** Headless behavior for the Comment pin component. */
export abstract class CommentPinBase extends StudioComponentBase<CommentPinProps> {
    readonly componentName = 'comment-pin'
    readonly componentKind: StudioKind = 'canvas'
}
