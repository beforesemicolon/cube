import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { MultiValueBase } from './MultiValueBase.js'

export class MultiValue extends MultiValueBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-multi-value', MultiValue)
export { MultiValueBase }
export type { MultiValueProps } from './MultiValueBase.js'
