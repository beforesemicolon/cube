import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { BadgeBase } from './BadgeBase.js'

export class Badge extends BadgeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-badge', Badge)
export { BadgeBase }
export type { BadgeProps } from './BadgeBase.js'
