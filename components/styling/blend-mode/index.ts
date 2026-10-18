import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { BlendModeBase } from './BlendModeBase.js'

export class BlendMode extends BlendModeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-blend-mode', BlendMode)
export { BlendModeBase }
export type { BlendModeProps } from './BlendModeBase.js'
