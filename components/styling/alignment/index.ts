import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AlignmentBase } from './AlignmentBase.js'

export class Alignment extends AlignmentBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-alignment', Alignment)
export { AlignmentBase }
export type { AlignmentProps } from './AlignmentBase.js'
