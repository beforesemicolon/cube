import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ResponsiveOverrideBase } from './ResponsiveOverrideBase.js'

export class ResponsiveOverride extends ResponsiveOverrideBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-responsive-override', ResponsiveOverride)
export { ResponsiveOverrideBase }
export type { ResponsiveOverrideProps } from './ResponsiveOverrideBase.js'
