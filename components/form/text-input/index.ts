import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TextInputBase } from './TextInputBase.js'

export class TextInput extends TextInputBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-text-input', TextInput)
export { TextInputBase }
export type { TextInputProps } from './TextInputBase.js'
