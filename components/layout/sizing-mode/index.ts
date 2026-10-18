import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SizingModeBase } from './SizingModeBase.js'

export class SizingMode extends SizingModeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-sizing-mode', SizingMode)
export { SizingModeBase }
export type { SizingModeProps } from './SizingModeBase.js'
