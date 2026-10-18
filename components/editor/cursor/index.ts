import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { CursorBase } from './CursorBase.js'

export class Cursor extends CursorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-cursor', Cursor)
export { CursorBase }
export type { CursorProps } from './CursorBase.js'
