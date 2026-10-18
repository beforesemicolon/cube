import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DiffPreviewBase } from './DiffPreviewBase.js'

export class DiffPreview extends DiffPreviewBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-diff-preview', DiffPreview)
export { DiffPreviewBase }
export type { DiffPreviewProps } from './DiffPreviewBase.js'
