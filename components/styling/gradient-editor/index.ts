import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { GradientEditorBase } from './GradientEditorBase.js'

export class GradientEditor extends GradientEditorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-gradient-editor', GradientEditor)
export { GradientEditorBase }
export type { GradientEditorProps } from './GradientEditorBase.js'
