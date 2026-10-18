import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ImageBrowserBase } from './ImageBrowserBase.js'

export class ImageBrowser extends ImageBrowserBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-image-browser', ImageBrowser)
export { ImageBrowserBase }
export type { ImageBrowserProps } from './ImageBrowserBase.js'
