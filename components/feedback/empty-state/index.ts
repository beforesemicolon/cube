import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { EmptyStateBase } from './EmptyStateBase.js'

export class EmptyState extends EmptyStateBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-empty-state', EmptyState)
export { EmptyStateBase }
export type { EmptyStateProps } from './EmptyStateBase.js'
