import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FilterBase } from './FilterBase.js'

export class Filter extends FilterBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-filter', Filter)
export { FilterBase }
export type { FilterProps } from './FilterBase.js'
