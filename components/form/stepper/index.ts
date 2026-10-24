import { register } from '../../core/Component.js'
import componentStylesheet from '../../studio/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { StepperBase } from './StepperBase.js';
export class Stepper extends StepperBase {
    stylesheet = componentStylesheet

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { StepperBase };
export type { StepperProps } from './StepperBase.js';

register('cb-stepper', Stepper)
