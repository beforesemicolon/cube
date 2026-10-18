import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ComponentPreviewBase } from './ComponentPreviewBase.js'

export class ComponentPreview extends ComponentPreviewBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-component-preview', ComponentPreview)
export { ComponentPreviewBase }
export type { ComponentPreviewProps } from './ComponentPreviewBase.js'
