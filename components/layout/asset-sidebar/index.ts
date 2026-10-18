import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AssetSidebarBase } from './AssetSidebarBase.js'

export class AssetSidebar extends AssetSidebarBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-asset-sidebar', AssetSidebar)
export { AssetSidebarBase }
export type { AssetSidebarProps } from './AssetSidebarBase.js'
