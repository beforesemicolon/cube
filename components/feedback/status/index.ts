import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { StatusBase } from './StatusBase.js'

export class Status extends StatusBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-status', Status)
export { StatusBase }
export type { StatusProps } from './StatusBase.js'
