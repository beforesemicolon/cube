import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { StatusBase } from './StatusBase.js';
export class Status extends StatusBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { StatusBase };
export type { StatusProps } from './StatusBase.js';
