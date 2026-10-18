import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { LayoutVisibilityBase } from './LayoutVisibilityBase.js'

export class LayoutVisibility extends LayoutVisibilityBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-layout-visibility', LayoutVisibility)
export { LayoutVisibilityBase }
export type { LayoutVisibilityProps } from './LayoutVisibilityBase.js'
