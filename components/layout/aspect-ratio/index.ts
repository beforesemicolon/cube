import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AspectRatioBase } from './AspectRatioBase.js'

export class AspectRatio extends AspectRatioBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-aspect-ratio', AspectRatio)
export { AspectRatioBase }
export type { AspectRatioProps } from './AspectRatioBase.js'
