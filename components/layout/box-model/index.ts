import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { BoxModelBase } from './BoxModelBase.js'

export class BoxModel extends BoxModelBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-box-model', BoxModel)
export { BoxModelBase }
export type { BoxModelProps } from './BoxModelBase.js'
