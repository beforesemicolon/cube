import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { StepperBase } from './StepperBase.js'

export class Stepper extends StepperBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-stepper', Stepper)
export { StepperBase }
export type { StepperProps } from './StepperBase.js'
