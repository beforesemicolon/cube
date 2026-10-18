import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PositionBase } from './PositionBase.js'

export class Position extends PositionBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-position', Position)
export { PositionBase }
export type { PositionProps } from './PositionBase.js'
