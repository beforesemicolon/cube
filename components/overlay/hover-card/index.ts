import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { HoverCardBase } from './HoverCardBase.js'

export class HoverCard extends HoverCardBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-hover-card', HoverCard)
export { HoverCardBase }
export type { HoverCardProps } from './HoverCardBase.js'
