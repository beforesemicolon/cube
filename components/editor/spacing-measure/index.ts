import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SpacingMeasureBase } from './SpacingMeasureBase.js'

export class SpacingMeasure extends SpacingMeasureBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-spacing-measure', SpacingMeasure)
export { SpacingMeasureBase }
export type { SpacingMeasureProps } from './SpacingMeasureBase.js'
