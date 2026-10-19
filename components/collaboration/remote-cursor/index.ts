import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { RemoteCursorBase } from './RemoteCursorBase.js';
export class RemoteCursor extends RemoteCursorBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { RemoteCursorBase };
export type { RemoteCursorProps } from './RemoteCursorBase.js';
