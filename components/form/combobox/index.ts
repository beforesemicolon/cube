import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ComboboxBase } from './ComboboxBase.js'

export class Combobox extends ComboboxBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-combobox', Combobox)
export { ComboboxBase }
export type { ComboboxProps } from './ComboboxBase.js'
