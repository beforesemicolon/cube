import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { CSSVariableBase } from './CSSVariableBase.js'

export class CSSVariable extends CSSVariableBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-css-variable', CSSVariable)
export { CSSVariableBase }
export type { CSSVariableProps } from './CSSVariableBase.js'
