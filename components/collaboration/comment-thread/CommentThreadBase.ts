import { CollectionBase, type CollectionProps } from '../../data-display/CollectionBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface CommentThreadProps extends CollectionProps {}

/** Headless behavior for the Comment thread component. */
export abstract class CommentThreadBase extends CollectionBase<CommentThreadProps> {
    readonly componentName = 'comment-thread'
    readonly componentKind: StudioKind = 'collaboration'
}
