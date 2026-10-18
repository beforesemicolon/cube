import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ColorSwatchBase } from './ColorSwatchBase.js'

export class ColorSwatch extends ColorSwatchBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-color-swatch', ColorSwatch)
export { ColorSwatchBase }
export type { ColorSwatchProps } from './ColorSwatchBase.js'
