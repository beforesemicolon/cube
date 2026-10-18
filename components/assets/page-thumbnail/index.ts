import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PageThumbnailBase } from './PageThumbnailBase.js'

export class PageThumbnail extends PageThumbnailBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-page-thumbnail', PageThumbnail)
export { PageThumbnailBase }
export type { PageThumbnailProps } from './PageThumbnailBase.js'
