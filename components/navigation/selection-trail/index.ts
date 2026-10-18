import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SelectionTrailBase } from './SelectionTrailBase.js'

export class SelectionTrail extends SelectionTrailBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-selection-trail', SelectionTrail)
export { SelectionTrailBase }
export type { SelectionTrailProps } from './SelectionTrailBase.js'
