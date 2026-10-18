import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AISelectionToolbarBase } from './AISelectionToolbarBase.js'

export class AISelectionToolbar extends AISelectionToolbarBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-ai-selection-toolbar', AISelectionToolbar)
export { AISelectionToolbarBase }
export type { AISelectionToolbarProps } from './AISelectionToolbarBase.js'
