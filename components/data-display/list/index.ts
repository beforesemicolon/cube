import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ListBase } from './ListBase.js'

export class List extends ListBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-list', List)
export { ListBase }
export type { ListProps } from './ListBase.js'
