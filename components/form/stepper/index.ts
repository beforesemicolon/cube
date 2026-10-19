import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { StepperBase } from './StepperBase.js';
export class Stepper extends StepperBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { StepperBase };
export type { StepperProps } from './StepperBase.js';
