import { css as componentStyles, type Template } from '../../core/runtime.js'
import {  createStudioView, type StudioView , studioCSS } from '../../studio/view.js';
import { DescriptionRowBase } from './DescriptionRowBase.js';
export class DescriptionRow extends DescriptionRowBase {
    stylesheet = componentStyles`${studioCSS}`

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { DescriptionRowBase };
export type { DescriptionRowProps } from './DescriptionRowBase.js';
