import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ZoomBase } from './ZoomBase.js'

export class Zoom extends ZoomBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-zoom', Zoom)
export { ZoomBase }
export type { ZoomProps } from './ZoomBase.js'
