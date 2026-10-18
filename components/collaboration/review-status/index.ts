import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ReviewStatusBase } from './ReviewStatusBase.js'

export class ReviewStatus extends ReviewStatusBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-review-status', ReviewStatus)
export { ReviewStatusBase }
export type { ReviewStatusProps } from './ReviewStatusBase.js'
