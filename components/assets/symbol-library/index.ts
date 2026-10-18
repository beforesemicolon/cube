import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SymbolLibraryBase } from './SymbolLibraryBase.js'

export class SymbolLibrary extends SymbolLibraryBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-symbol-library', SymbolLibrary)
export { SymbolLibraryBase }
export type { SymbolLibraryProps } from './SymbolLibraryBase.js'
