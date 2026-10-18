import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PopoverBase } from './PopoverBase.js'

export class Popover extends PopoverBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-popover', Popover)
export { PopoverBase }
export type { PopoverProps } from './PopoverBase.js'
