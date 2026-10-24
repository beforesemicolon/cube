import { register } from '../../core/Component.js'
import componentStylesheet from '../../studio/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RangeSliderBase } from './RangeSliderBase.js';
export class RangeSlider extends RangeSliderBase {
    stylesheet = componentStylesheet

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { RangeSliderBase };
export type { RangeSliderProps } from './RangeSliderBase.js';

register('cb-range-slider', RangeSlider)
