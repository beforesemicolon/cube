import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DragPreviewBase } from './DragPreviewBase.js'

export class DragPreview extends DragPreviewBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-drag-preview', DragPreview)
export { DragPreviewBase }
export type { DragPreviewProps } from './DragPreviewBase.js'
