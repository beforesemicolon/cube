import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { InstanceIndicatorBase } from './InstanceIndicatorBase.js'

export class InstanceIndicator extends InstanceIndicatorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-instance-indicator', InstanceIndicator)
export { InstanceIndicatorBase }
export type { InstanceIndicatorProps } from './InstanceIndicatorBase.js'
