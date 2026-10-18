import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ReorderBase } from './ReorderBase.js'

export class Reorder extends ReorderBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-reorder', Reorder)
export { ReorderBase }
export type { ReorderProps } from './ReorderBase.js'
