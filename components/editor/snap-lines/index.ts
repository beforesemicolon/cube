import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SnapLinesBase } from './SnapLinesBase.js'

export class SnapLines extends SnapLinesBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-snap-lines', SnapLines)
export { SnapLinesBase }
export type { SnapLinesProps } from './SnapLinesBase.js'
