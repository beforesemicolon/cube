import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { GridEditorBase } from './GridEditorBase.js'

export class GridEditor extends GridEditorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-grid-editor', GridEditor)
export { GridEditorBase }
export type { GridEditorProps } from './GridEditorBase.js'
