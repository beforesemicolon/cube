import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DropIndicatorBase } from './DropIndicatorBase.js'

export class DropIndicator extends DropIndicatorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-drop-indicator', DropIndicator)
export { DropIndicatorBase }
export type { DropIndicatorProps } from './DropIndicatorBase.js'
