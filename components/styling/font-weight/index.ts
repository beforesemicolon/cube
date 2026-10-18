import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FontWeightBase } from './FontWeightBase.js'

export class FontWeight extends FontWeightBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-font-weight', FontWeight)
export { FontWeightBase }
export type { FontWeightProps } from './FontWeightBase.js'
