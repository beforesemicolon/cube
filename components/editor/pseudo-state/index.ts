import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PseudoStateBase } from './PseudoStateBase.js'

export class PseudoState extends PseudoStateBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-pseudo-state', PseudoState)
export { PseudoStateBase }
export type { PseudoStateProps } from './PseudoStateBase.js'
