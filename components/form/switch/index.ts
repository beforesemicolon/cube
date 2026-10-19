import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { SwitchBase } from './SwitchBase.js';
export class Switch extends SwitchBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { SwitchBase };
export type { SwitchProps } from './SwitchBase.js';
