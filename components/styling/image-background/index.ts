import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ImageBackgroundBase } from './ImageBackgroundBase.js'

export class ImageBackground extends ImageBackgroundBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-image-background', ImageBackground)
export { ImageBackgroundBase }
export type { ImageBackgroundProps } from './ImageBackgroundBase.js'
