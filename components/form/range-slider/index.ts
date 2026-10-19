import { css as componentStyles, type Template } from '../../core/runtime.js'
import {  createStudioView, type StudioView , studioCSS } from '../../studio/view.js';
import { RangeSliderBase } from './RangeSliderBase.js';
export class RangeSlider extends RangeSliderBase {
    stylesheet = componentStyles`${studioCSS}`

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { RangeSliderBase };
export type { RangeSliderProps } from './RangeSliderBase.js';
