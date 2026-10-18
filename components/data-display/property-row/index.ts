import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PropertyRowBase } from './PropertyRowBase.js'

export class PropertyRow extends PropertyRowBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-property-row', PropertyRow)
export { PropertyRowBase }
export type { PropertyRowProps } from './PropertyRowBase.js'
