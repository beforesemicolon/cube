import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TopBarBase } from './TopBarBase.js'

export class TopBar extends TopBarBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-top-bar', TopBar)
export { TopBarBase }
export type { TopBarProps } from './TopBarBase.js'
