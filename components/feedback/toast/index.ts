import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { ToastBase } from './ToastBase.js';
export class Toast extends ToastBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { ToastBase };
export type { ToastProps } from './ToastBase.js';
