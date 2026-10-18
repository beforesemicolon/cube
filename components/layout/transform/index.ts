import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TransformBase } from './TransformBase.js'

export class Transform extends TransformBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-transform', Transform)
export { TransformBase }
export type { TransformProps } from './TransformBase.js'
