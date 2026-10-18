import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { LayerRowBase } from './LayerRowBase.js'

export class LayerRow extends LayerRowBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-layer-row', LayerRow)
export { LayerRowBase }
export type { LayerRowProps } from './LayerRowBase.js'
