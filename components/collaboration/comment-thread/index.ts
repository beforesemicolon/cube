import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { CommentThreadBase } from './CommentThreadBase.js'

export class CommentThread extends CommentThreadBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-comment-thread', CommentThread)
export { CommentThreadBase }
export type { CommentThreadProps } from './CommentThreadBase.js'
