import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { HueBase } from './HueBase.js'

export class Hue extends HueBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-hue', Hue)
export { HueBase }
export type { HueProps } from './HueBase.js'
