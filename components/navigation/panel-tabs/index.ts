import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PanelTabsBase } from './PanelTabsBase.js'

export class PanelTabs extends PanelTabsBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-panel-tabs', PanelTabs)
export { PanelTabsBase }
export type { PanelTabsProps } from './PanelTabsBase.js'
