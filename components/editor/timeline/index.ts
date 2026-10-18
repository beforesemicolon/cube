import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TimelineBase } from './TimelineBase.js'

export class Timeline extends TimelineBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-timeline', Timeline)
export { TimelineBase }
export type { TimelineProps } from './TimelineBase.js'
