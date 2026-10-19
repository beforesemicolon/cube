import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { CheckboxBase } from './CheckboxBase.js';
export class Checkbox extends CheckboxBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { CheckboxBase };
export type { CheckboxProps } from './CheckboxBase.js';
