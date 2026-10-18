import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SwitchBase } from './SwitchBase.js'

export class Switch extends SwitchBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-switch', Switch)
export { SwitchBase }
export type { SwitchProps } from './SwitchBase.js'
