import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RangeSliderBase } from './RangeSliderBase.js'

export class RangeSlider extends RangeSliderBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-range-slider', RangeSlider)
export { RangeSliderBase }
export type { RangeSliderProps } from './RangeSliderBase.js'
