import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DataBindingBase } from './DataBindingBase.js'

export class DataBinding extends DataBindingBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-data-binding', DataBinding)
export { DataBindingBase }
export type { DataBindingProps } from './DataBindingBase.js'
