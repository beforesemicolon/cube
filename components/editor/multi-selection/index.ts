import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { MultiSelectionBase } from './MultiSelectionBase.js'

export class MultiSelection extends MultiSelectionBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-multi-selection', MultiSelection)
export { MultiSelectionBase }
export type { MultiSelectionProps } from './MultiSelectionBase.js'
