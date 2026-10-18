import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { GridTrackBase } from './GridTrackBase.js'

export class GridTrack extends GridTrackBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-grid-track', GridTrack)
export { GridTrackBase }
export type { GridTrackProps } from './GridTrackBase.js'
