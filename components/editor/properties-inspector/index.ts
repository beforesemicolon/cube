import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PropertiesInspectorBase } from './PropertiesInspectorBase.js'

export class PropertiesInspector extends PropertiesInspectorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-properties-inspector', PropertiesInspector)
export { PropertiesInspectorBase }
export type { PropertiesInspectorProps } from './PropertiesInspectorBase.js'
