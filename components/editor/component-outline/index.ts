import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ComponentOutlineBase } from './ComponentOutlineBase.js'

export class ComponentOutline extends ComponentOutlineBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-component-outline', ComponentOutline)
export { ComponentOutlineBase }
export type { ComponentOutlineProps } from './ComponentOutlineBase.js'
