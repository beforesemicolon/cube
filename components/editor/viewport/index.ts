import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ViewportBase } from './ViewportBase.js'

export class Viewport extends ViewportBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-viewport', Viewport)
export { ViewportBase }
export type { ViewportProps } from './ViewportBase.js'
