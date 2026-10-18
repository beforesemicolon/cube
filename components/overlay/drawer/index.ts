import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DrawerBase } from './DrawerBase.js'

export class Drawer extends DrawerBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-drawer', Drawer)
export { DrawerBase }
export type { DrawerProps } from './DrawerBase.js'
