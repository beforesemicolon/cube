import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { OverflowBase } from './OverflowBase.js'

export class Overflow extends OverflowBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-overflow', Overflow)
export { OverflowBase }
export type { OverflowProps } from './OverflowBase.js'
