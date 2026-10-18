import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { CanvasMenuBase } from './CanvasMenuBase.js'

export class CanvasMenu extends CanvasMenuBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-canvas-menu', CanvasMenu)
export { CanvasMenuBase }
export type { CanvasMenuProps } from './CanvasMenuBase.js'
