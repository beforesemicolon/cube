import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FlexAlignmentBase } from './FlexAlignmentBase.js'

export class FlexAlignment extends FlexAlignmentBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-flex-alignment', FlexAlignment)
export { FlexAlignmentBase }
export type { FlexAlignmentProps } from './FlexAlignmentBase.js'
