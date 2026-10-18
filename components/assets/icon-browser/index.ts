import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { IconBrowserBase } from './IconBrowserBase.js'

export class IconBrowser extends IconBrowserBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-icon-browser', IconBrowser)
export { IconBrowserBase }
export type { IconBrowserProps } from './IconBrowserBase.js'
