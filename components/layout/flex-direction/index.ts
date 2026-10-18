import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FlexDirectionBase } from './FlexDirectionBase.js'

export class FlexDirection extends FlexDirectionBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-flex-direction', FlexDirection)
export { FlexDirectionBase }
export type { FlexDirectionProps } from './FlexDirectionBase.js'
