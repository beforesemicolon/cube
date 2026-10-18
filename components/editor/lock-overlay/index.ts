import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { LockOverlayBase } from './LockOverlayBase.js'

export class LockOverlay extends LockOverlayBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-lock-overlay', LockOverlay)
export { LockOverlayBase }
export type { LockOverlayProps } from './LockOverlayBase.js'
