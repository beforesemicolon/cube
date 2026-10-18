import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AnnotationBase } from './AnnotationBase.js'

export class Annotation extends AnnotationBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-annotation', Annotation)
export { AnnotationBase }
export type { AnnotationProps } from './AnnotationBase.js'
