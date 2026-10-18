import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { EditableLabelBase } from './EditableLabelBase.js'

export class EditableLabel extends EditableLabelBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-editable-label', EditableLabel)
export { EditableLabelBase }
export type { EditableLabelProps } from './EditableLabelBase.js'
