import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ProgressBase } from './ProgressBase.js'

export class Progress extends ProgressBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-progress', Progress)
export { ProgressBase }
export type { ProgressProps } from './ProgressBase.js'
