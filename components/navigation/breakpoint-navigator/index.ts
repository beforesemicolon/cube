import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { BreakpointNavigatorBase } from './BreakpointNavigatorBase.js'

export class BreakpointNavigator extends BreakpointNavigatorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-breakpoint-navigator', BreakpointNavigator)
export { BreakpointNavigatorBase }
export type { BreakpointNavigatorProps } from './BreakpointNavigatorBase.js'
