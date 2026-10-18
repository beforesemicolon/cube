import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { EyedropperBase } from './EyedropperBase.js'

export class Eyedropper extends EyedropperBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-eyedropper', Eyedropper)
export { EyedropperBase }
export type { EyedropperProps } from './EyedropperBase.js'
