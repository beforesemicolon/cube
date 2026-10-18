import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FloatingToolbarBase } from './FloatingToolbarBase.js'

export class FloatingToolbar extends FloatingToolbarBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-floating-toolbar', FloatingToolbar)
export { FloatingToolbarBase }
export type { FloatingToolbarProps } from './FloatingToolbarBase.js'
