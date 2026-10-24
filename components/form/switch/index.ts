import { register } from '../../core/Component.js'
import componentStylesheet from '../../studio/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SwitchBase } from './SwitchBase.js';
export class Switch extends SwitchBase {
    stylesheet = componentStylesheet

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { SwitchBase };
export type { SwitchProps } from './SwitchBase.js';

register('cb-switch', Switch)
