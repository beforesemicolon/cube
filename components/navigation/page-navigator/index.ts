import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PageNavigatorBase } from './PageNavigatorBase.js'

export class PageNavigator extends PageNavigatorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-page-navigator', PageNavigator)
export { PageNavigatorBase }
export type { PageNavigatorProps } from './PageNavigatorBase.js'
