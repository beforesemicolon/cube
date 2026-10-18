import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { LinkedDimensionBase } from './LinkedDimensionBase.js'

export class LinkedDimension extends LinkedDimensionBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-linked-dimension', LinkedDimension)
export { LinkedDimensionBase }
export type { LinkedDimensionProps } from './LinkedDimensionBase.js'
