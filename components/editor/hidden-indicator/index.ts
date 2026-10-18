import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { HiddenIndicatorBase } from './HiddenIndicatorBase.js'

export class HiddenIndicator extends HiddenIndicatorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-hidden-indicator', HiddenIndicator)
export { HiddenIndicatorBase }
export type { HiddenIndicatorProps } from './HiddenIndicatorBase.js'
