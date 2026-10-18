import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ShadowBase } from './ShadowBase.js'

export class Shadow extends ShadowBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-shadow', Shadow)
export { ShadowBase }
export type { ShadowProps } from './ShadowBase.js'
