import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { VariableBindingBase } from './VariableBindingBase.js'

export class VariableBinding extends VariableBindingBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-variable-binding', VariableBinding)
export { VariableBindingBase }
export type { VariableBindingProps } from './VariableBindingBase.js'
