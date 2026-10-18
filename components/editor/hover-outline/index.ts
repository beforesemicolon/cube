import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { HoverOutlineBase } from './HoverOutlineBase.js'

export class HoverOutline extends HoverOutlineBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-hover-outline', HoverOutline)
export { HoverOutlineBase }
export type { HoverOutlineProps } from './HoverOutlineBase.js'
