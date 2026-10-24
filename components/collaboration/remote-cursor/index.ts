import { register } from '../../core/Component.js'
import componentStylesheet from '../../studio/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RemoteCursorBase } from './RemoteCursorBase.js';
export class RemoteCursor extends RemoteCursorBase {
    stylesheet = componentStylesheet

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { RemoteCursorBase };
export type { RemoteCursorProps } from './RemoteCursorBase.js';

register('cb-remote-cursor', RemoteCursor)
