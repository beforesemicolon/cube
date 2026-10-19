import { css as componentStyles, type Template } from '../../core/runtime.js'
import {  createStudioView, type StudioView , studioCSS } from '../../studio/view.js';
import { RemoteCursorBase } from './RemoteCursorBase.js';
export class RemoteCursor extends RemoteCursorBase {
    stylesheet = componentStyles`${studioCSS}`

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { RemoteCursorBase };
export type { RemoteCursorProps } from './RemoteCursorBase.js';
