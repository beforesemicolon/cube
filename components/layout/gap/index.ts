import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { GapBase } from './GapBase.js'

export class Gap extends GapBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-gap', Gap)
export { GapBase }
export type { GapProps } from './GapBase.js'
