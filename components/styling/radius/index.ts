import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RadiusBase } from './RadiusBase.js'

export class Radius extends RadiusBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-radius', Radius)
export { RadiusBase }
export type { RadiusProps } from './RadiusBase.js'
