import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface CommentThreadProps extends StudioProps {}

/** Headless behavior for the Comment thread component. */
export abstract class CommentThreadBase extends StudioComponentBase<CommentThreadProps> {
    readonly componentName = 'comment-thread'
    readonly componentKind: StudioKind = 'collaboration'
}
