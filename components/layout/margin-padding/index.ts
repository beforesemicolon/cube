import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { MarginPaddingBase } from './MarginPaddingBase.js'

export class MarginPadding extends MarginPaddingBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-margin-padding', MarginPadding)
export { MarginPaddingBase }
export type { MarginPaddingProps } from './MarginPaddingBase.js'
