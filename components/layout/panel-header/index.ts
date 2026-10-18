import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PanelHeaderBase } from './PanelHeaderBase.js'

export class PanelHeader extends PanelHeaderBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-panel-header', PanelHeader)
export { PanelHeaderBase }
export type { PanelHeaderProps } from './PanelHeaderBase.js'
