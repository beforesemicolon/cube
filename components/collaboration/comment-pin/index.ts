import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { CommentPinBase } from './CommentPinBase.js'

export class CommentPin extends CommentPinBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-comment-pin', CommentPin)
export { CommentPinBase }
export type { CommentPinProps } from './CommentPinBase.js'
