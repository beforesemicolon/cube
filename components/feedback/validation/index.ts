import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ValidationBase } from './ValidationBase.js'

export class Validation extends ValidationBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-validation', Validation)
export { ValidationBase }
export type { ValidationProps } from './ValidationBase.js'
