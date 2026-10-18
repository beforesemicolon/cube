import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RemoteCursorBase } from './RemoteCursorBase.js'

export class RemoteCursor extends RemoteCursorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-remote-cursor', RemoteCursor)
export { RemoteCursorBase }
export type { RemoteCursorProps } from './RemoteCursorBase.js'
