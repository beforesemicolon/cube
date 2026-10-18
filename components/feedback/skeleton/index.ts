import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SkeletonBase } from './SkeletonBase.js'

export class Skeleton extends SkeletonBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-skeleton', Skeleton)
export { SkeletonBase }
export type { SkeletonProps } from './SkeletonBase.js'
