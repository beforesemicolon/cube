import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { EasingBase } from './EasingBase.js'

export class Easing extends EasingBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-easing', Easing)
export { EasingBase }
export type { EasingProps } from './EasingBase.js'
