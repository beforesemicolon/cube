import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SearchBase } from './SearchBase.js'

export class Search extends SearchBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-search', Search)
export { SearchBase }
export type { SearchProps } from './SearchBase.js'
