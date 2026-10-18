import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { OpacityBase } from './OpacityBase.js'

export class Opacity extends OpacityBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-opacity', Opacity)
export { OpacityBase }
export type { OpacityProps } from './OpacityBase.js'
