import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { MarqueeBase } from './MarqueeBase.js'

export class Marquee extends MarqueeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-marquee', Marquee)
export { MarqueeBase }
export type { MarqueeProps } from './MarqueeBase.js'
