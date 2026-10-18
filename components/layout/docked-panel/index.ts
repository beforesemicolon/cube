import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DockedPanelBase } from './DockedPanelBase.js'

export class DockedPanel extends DockedPanelBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-docked-panel', DockedPanel)
export { DockedPanelBase }
export type { DockedPanelProps } from './DockedPanelBase.js'
