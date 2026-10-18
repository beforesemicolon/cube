import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { BezierBase } from './BezierBase.js'

export class Bezier extends BezierBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-bezier', Bezier)
export { BezierBase }
export type { BezierProps } from './BezierBase.js'
