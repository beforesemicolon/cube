import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ZIndexBase } from './ZIndexBase.js'

export class ZIndex extends ZIndexBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-z-index', ZIndex)
export { ZIndexBase }
export type { ZIndexProps } from './ZIndexBase.js'
