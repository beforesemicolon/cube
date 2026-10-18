import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AvatarBase } from './AvatarBase.js'

export class Avatar extends AvatarBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-avatar', Avatar)
export { AvatarBase }
export type { AvatarProps } from './AvatarBase.js'
