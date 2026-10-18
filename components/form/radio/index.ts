import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RadioBase } from './RadioBase.js'

export class Radio extends RadioBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-radio', Radio)
export { RadioBase }
export type { RadioProps } from './RadioBase.js'
