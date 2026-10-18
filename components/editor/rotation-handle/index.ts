import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RotationHandleBase } from './RotationHandleBase.js'

export class RotationHandle extends RotationHandleBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-rotation-handle', RotationHandle)
export { RotationHandleBase }
export type { RotationHandleProps } from './RotationHandleBase.js'
