import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { MediaPreviewBase } from './MediaPreviewBase.js'

export class MediaPreview extends MediaPreviewBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-media-preview', MediaPreview)
export { MediaPreviewBase }
export type { MediaPreviewProps } from './MediaPreviewBase.js'
