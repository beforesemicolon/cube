import { css as componentStyles, type Template } from '../../core/runtime.js'
import {  createStudioView, type StudioView , studioCSS } from '../../studio/view.js';
import { ProgressBase } from './ProgressBase.js';
export class Progress extends ProgressBase {
    stylesheet = componentStyles`${studioCSS}`

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { ProgressBase };
export type { ProgressProps } from './ProgressBase.js';
