import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { VariantsBase } from './VariantsBase.js'

export class Variants extends VariantsBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-variants', Variants)
export { VariantsBase }
export type { VariantsProps } from './VariantsBase.js'
