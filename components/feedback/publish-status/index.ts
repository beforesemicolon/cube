import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PublishStatusBase } from './PublishStatusBase.js'

export class PublishStatus extends PublishStatusBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-publish-status', PublishStatus)
export { PublishStatusBase }
export type { PublishStatusProps } from './PublishStatusBase.js'
