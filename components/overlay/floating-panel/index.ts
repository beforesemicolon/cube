import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FloatingPanelBase } from './FloatingPanelBase.js'

export class FloatingPanel extends FloatingPanelBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-floating-panel', FloatingPanel)
export { FloatingPanelBase }
export type { FloatingPanelProps } from './FloatingPanelBase.js'
