import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PanBase } from './PanBase.js'

export class Pan extends PanBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-pan', Pan)
export { PanBase }
export type { PanProps } from './PanBase.js'
