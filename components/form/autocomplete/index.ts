import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AutocompleteBase } from './AutocompleteBase.js'

export class Autocomplete extends AutocompleteBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-autocomplete', Autocomplete)
export { AutocompleteBase }
export type { AutocompleteProps } from './AutocompleteBase.js'
