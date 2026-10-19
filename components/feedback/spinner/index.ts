import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { SpinnerBase } from './SpinnerBase.js';
export class Spinner extends SpinnerBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { SpinnerBase };
export type { SpinnerProps } from './SpinnerBase.js';
