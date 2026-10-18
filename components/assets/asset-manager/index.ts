import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AssetManagerBase } from './AssetManagerBase.js'

export class AssetManager extends AssetManagerBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-asset-manager', AssetManager)
export { AssetManagerBase }
export type { AssetManagerProps } from './AssetManagerBase.js'
