import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PreviewSwitchBase } from './PreviewSwitchBase.js'

export class PreviewSwitch extends PreviewSwitchBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-preview-switch', PreviewSwitch)
export { PreviewSwitchBase }
export type { PreviewSwitchProps } from './PreviewSwitchBase.js'
