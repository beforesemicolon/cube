import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { CheckboxBase } from './CheckboxBase.js'

export class Checkbox extends CheckboxBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-checkbox', Checkbox)
export { CheckboxBase }
export type { CheckboxProps } from './CheckboxBase.js'
