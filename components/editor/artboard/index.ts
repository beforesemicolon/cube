import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ArtboardBase } from './ArtboardBase.js'

export class Artboard extends ArtboardBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-artboard', Artboard)
export { ArtboardBase }
export type { ArtboardProps } from './ArtboardBase.js'
