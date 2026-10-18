import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DesignTokenBase } from './DesignTokenBase.js'

export class DesignToken extends DesignTokenBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-design-token', DesignToken)
export { DesignTokenBase }
export type { DesignTokenProps } from './DesignTokenBase.js'
