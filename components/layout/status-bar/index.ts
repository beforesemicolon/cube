import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { StatusBarBase } from './StatusBarBase.js'

export class StatusBar extends StatusBarBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-status-bar', StatusBar)
export { StatusBarBase }
export type { StatusBarProps } from './StatusBarBase.js'
