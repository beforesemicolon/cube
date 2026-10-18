import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { WidthHeightBase } from './WidthHeightBase.js'

export class WidthHeight extends WidthHeightBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-width-height', WidthHeight)
export { WidthHeightBase }
export type { WidthHeightProps } from './WidthHeightBase.js'
