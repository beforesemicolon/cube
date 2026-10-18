import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { SmartGuidesBase } from './SmartGuidesBase.js'

export class SmartGuides extends SmartGuidesBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-smart-guides', SmartGuides)
export { SmartGuidesBase }
export type { SmartGuidesProps } from './SmartGuidesBase.js'
