import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ConstraintsBase } from './ConstraintsBase.js'

export class Constraints extends ConstraintsBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-constraints', Constraints)
export { ConstraintsBase }
export type { ConstraintsProps } from './ConstraintsBase.js'
