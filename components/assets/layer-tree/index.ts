import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { LayerTreeBase } from './LayerTreeBase.js'

export class LayerTree extends LayerTreeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-layer-tree', LayerTree)
export { LayerTreeBase }
export type { LayerTreeProps } from './LayerTreeBase.js'
