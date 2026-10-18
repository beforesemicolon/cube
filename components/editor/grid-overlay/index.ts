import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { GridOverlayBase } from './GridOverlayBase.js'

export class GridOverlay extends GridOverlayBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-grid-overlay', GridOverlay)
export { GridOverlayBase }
export type { GridOverlayProps } from './GridOverlayBase.js'
