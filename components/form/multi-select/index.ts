import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { MultiSelectBase } from './MultiSelectBase.js'

export class MultiSelect extends MultiSelectBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-multi-select', MultiSelect)
export { MultiSelectBase }
export type { MultiSelectProps } from './MultiSelectBase.js'
