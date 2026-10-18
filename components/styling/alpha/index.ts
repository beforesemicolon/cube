import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AlphaBase } from './AlphaBase.js'

export class Alpha extends AlphaBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-alpha', Alpha)
export { AlphaBase }
export type { AlphaProps } from './AlphaBase.js'
