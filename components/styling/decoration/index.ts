import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DecorationBase } from './DecorationBase.js'

export class Decoration extends DecorationBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-decoration', Decoration)
export { DecorationBase }
export type { DecorationProps } from './DecorationBase.js'
