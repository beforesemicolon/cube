import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { LockBase } from './LockBase.js'

export class Lock extends LockBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-lock', Lock)
export { LockBase }
export type { LockProps } from './LockBase.js'
