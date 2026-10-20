import { Component, type ComponentProps } from '../../core/Component.js'
import type { StudioKind } from '../../studio/types.js'

export interface CommentPinProps extends ComponentProps {}

/** Headless behavior for the Comment pin component. */
export abstract class CommentPinBase extends Component<CommentPinProps> {
    readonly componentName = 'comment-pin'
    readonly componentKind: StudioKind = 'canvas'
}
