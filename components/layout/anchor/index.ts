import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AnchorBase } from './AnchorBase.js'

export class Anchor extends AnchorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-anchor', Anchor)
export { AnchorBase }
export type { AnchorProps } from './AnchorBase.js'
