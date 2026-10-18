import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { MinMaxBase } from './MinMaxBase.js'

export class MinMax extends MinMaxBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-min-max', MinMax)
export { MinMaxBase }
export type { MinMaxProps } from './MinMaxBase.js'
