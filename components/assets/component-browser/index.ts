import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ComponentBrowserBase } from './ComponentBrowserBase.js'

export class ComponentBrowser extends ComponentBrowserBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-component-browser', ComponentBrowser)
export { ComponentBrowserBase }
export type { ComponentBrowserProps } from './ComponentBrowserBase.js'
