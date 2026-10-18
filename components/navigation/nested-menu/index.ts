import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { NestedMenuBase } from './NestedMenuBase.js'

export class NestedMenu extends NestedMenuBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-nested-menu', NestedMenu)
export { NestedMenuBase }
export type { NestedMenuProps } from './NestedMenuBase.js'
