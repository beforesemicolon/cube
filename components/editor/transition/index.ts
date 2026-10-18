import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TransitionBase } from './TransitionBase.js'

export class Transition extends TransitionBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-transition', Transition)
export { TransitionBase }
export type { TransitionProps } from './TransitionBase.js'
