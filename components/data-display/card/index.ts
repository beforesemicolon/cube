import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { CardBase } from './CardBase.js'

export class Card extends CardBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-card', Card)
export { CardBase }
export type { CardProps } from './CardBase.js'
