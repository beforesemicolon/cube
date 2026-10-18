import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ConflictBase } from './ConflictBase.js'

export class Conflict extends ConflictBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-conflict', Conflict)
export { ConflictBase }
export type { ConflictProps } from './ConflictBase.js'
