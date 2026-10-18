import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { NumberInputBase } from './NumberInputBase.js'

export class NumberInput extends NumberInputBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-number-input', NumberInput)
export { NumberInputBase }
export type { NumberInputProps } from './NumberInputBase.js'
