import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { StrokeBase } from './StrokeBase.js'

export class Stroke extends StrokeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-stroke', Stroke)
export { StrokeBase }
export type { StrokeProps } from './StrokeBase.js'
