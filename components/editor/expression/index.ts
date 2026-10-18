import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ExpressionBase } from './ExpressionBase.js'

export class Expression extends ExpressionBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-expression', Expression)
export { ExpressionBase }
export type { ExpressionProps } from './ExpressionBase.js'
