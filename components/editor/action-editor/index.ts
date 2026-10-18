import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ActionEditorBase } from './ActionEditorBase.js'

export class ActionEditor extends ActionEditorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-action-editor', ActionEditor)
export { ActionEditorBase }
export type { ActionEditorProps } from './ActionEditorBase.js'
