import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { InspectorBase } from './InspectorBase.js'

export class Inspector extends InspectorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-inspector', Inspector)
export { InspectorBase }
export type { InspectorProps } from './InspectorBase.js'
