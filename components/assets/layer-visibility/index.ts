import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { LayerVisibilityBase } from './LayerVisibilityBase.js'

export class LayerVisibility extends LayerVisibilityBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-layer-visibility', LayerVisibility)
export { LayerVisibilityBase }
export type { LayerVisibilityProps } from './LayerVisibilityBase.js'
