import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AIActionMenuBase } from './AIActionMenuBase.js'

export class AIActionMenu extends AIActionMenuBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-ai-action-menu', AIActionMenu)
export { AIActionMenuBase }
export type { AIActionMenuProps } from './AIActionMenuBase.js'
