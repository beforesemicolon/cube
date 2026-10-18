import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ConditionalVisibilityBase } from './ConditionalVisibilityBase.js'

export class ConditionalVisibility extends ConditionalVisibilityBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-conditional-visibility', ConditionalVisibility)
export { ConditionalVisibilityBase }
export type { ConditionalVisibilityProps } from './ConditionalVisibilityBase.js'
