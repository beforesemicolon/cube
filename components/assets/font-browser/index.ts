import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FontBrowserBase } from './FontBrowserBase.js'

export class FontBrowser extends FontBrowserBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-font-browser', FontBrowser)
export { FontBrowserBase }
export type { FontBrowserProps } from './FontBrowserBase.js'
