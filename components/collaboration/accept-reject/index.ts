import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AcceptRejectBase } from './AcceptRejectBase.js'

export class AcceptReject extends AcceptRejectBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-accept-reject', AcceptReject)
export { AcceptRejectBase }
export type { AcceptRejectProps } from './AcceptRejectBase.js'
