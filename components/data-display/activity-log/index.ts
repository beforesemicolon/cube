import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ActivityLogBase } from './ActivityLogBase.js'

export class ActivityLog extends ActivityLogBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-activity-log', ActivityLog)
export { ActivityLogBase }
export type { ActivityLogProps } from './ActivityLogBase.js'
