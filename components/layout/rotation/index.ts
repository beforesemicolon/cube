import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RotationBase } from './RotationBase.js'

export class Rotation extends RotationBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-rotation', Rotation)
export { RotationBase }
export type { RotationProps } from './RotationBase.js'
