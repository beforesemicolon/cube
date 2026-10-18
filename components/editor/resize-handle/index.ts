import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ResizeHandleBase } from './ResizeHandleBase.js'

export class ResizeHandle extends ResizeHandleBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-resize-handle', ResizeHandle)
export { ResizeHandleBase }
export type { ResizeHandleProps } from './ResizeHandleBase.js'
