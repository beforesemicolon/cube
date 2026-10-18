import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FillBase } from './FillBase.js'

export class Fill extends FillBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-fill', Fill)
export { FillBase }
export type { FillProps } from './FillBase.js'
