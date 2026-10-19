import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { AlertBase } from './AlertBase.js';
export class Alert extends AlertBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { AlertBase };
export type { AlertProps } from './AlertBase.js';
