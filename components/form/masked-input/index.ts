import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { MaskedInputBase } from './MaskedInputBase.js'

export class MaskedInput extends MaskedInputBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-masked-input', MaskedInput)
export { MaskedInputBase }
export type { MaskedInputProps } from './MaskedInputBase.js'
