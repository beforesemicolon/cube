import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PropertyGroupBase } from './PropertyGroupBase.js'

export class PropertyGroup extends PropertyGroupBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-property-group', PropertyGroup)
export { PropertyGroupBase }
export type { PropertyGroupProps } from './PropertyGroupBase.js'
