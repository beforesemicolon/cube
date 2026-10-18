import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SelectionBoxBase } from './SelectionBoxBase.js'

export class SelectionBox extends SelectionBoxBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-selection-box', SelectionBox)
export { SelectionBoxBase }
export type { SelectionBoxProps } from './SelectionBoxBase.js'
