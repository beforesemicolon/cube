import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { UserMenuBase } from './UserMenuBase.js'

export class UserMenu extends UserMenuBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-user-menu', UserMenu)
export { UserMenuBase }
export type { UserMenuProps } from './UserMenuBase.js'
