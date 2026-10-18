import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SuggestedChangeBase } from './SuggestedChangeBase.js'

export class SuggestedChange extends SuggestedChangeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-suggested-change', SuggestedChange)
export { SuggestedChangeBase }
export type { SuggestedChangeProps } from './SuggestedChangeBase.js'
