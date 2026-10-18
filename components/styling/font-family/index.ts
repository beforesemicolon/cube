import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FontFamilyBase } from './FontFamilyBase.js'

export class FontFamily extends FontFamilyBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-font-family', FontFamily)
export { FontFamilyBase }
export type { FontFamilyProps } from './FontFamilyBase.js'
