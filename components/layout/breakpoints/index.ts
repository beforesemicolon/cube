import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { BreakpointsBase } from './BreakpointsBase.js'

export class Breakpoints extends BreakpointsBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-breakpoints', Breakpoints)
export { BreakpointsBase }
export type { BreakpointsProps } from './BreakpointsBase.js'
