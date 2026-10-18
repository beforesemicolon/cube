import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { GradientStopsBase } from './GradientStopsBase.js'

export class GradientStops extends GradientStopsBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-gradient-stops', GradientStops)
export { GradientStopsBase }
export type { GradientStopsProps } from './GradientStopsBase.js'
