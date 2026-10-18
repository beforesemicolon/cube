import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AlertBase } from './AlertBase.js'

export class Alert extends AlertBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-alert', Alert)
export { AlertBase }
export type { AlertProps } from './AlertBase.js'
