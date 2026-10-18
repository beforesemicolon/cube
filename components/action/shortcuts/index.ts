import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ShortcutsBase } from './ShortcutsBase.js'

export class Shortcuts extends ShortcutsBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-shortcuts', Shortcuts)
export { ShortcutsBase }
export type { ShortcutsProps } from './ShortcutsBase.js'
