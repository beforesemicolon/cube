import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { InlineTextBase } from './InlineTextBase.js'

export class InlineText extends InlineTextBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-inline-text', InlineText)
export { InlineTextBase }
export type { InlineTextProps } from './InlineTextBase.js'
