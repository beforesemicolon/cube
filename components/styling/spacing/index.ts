import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SpacingBase } from './SpacingBase.js'

export class Spacing extends SpacingBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-spacing', Spacing)
export { SpacingBase }
export type { SpacingProps } from './SpacingBase.js'
