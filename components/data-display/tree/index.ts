import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TreeBase } from './TreeBase.js'

export class Tree extends TreeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-tree', Tree)
export { TreeBase }
export type { TreeProps } from './TreeBase.js'
