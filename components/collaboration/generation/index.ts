import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { GenerationBase } from './GenerationBase.js'

export class Generation extends GenerationBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-generation', Generation)
export { GenerationBase }
export type { GenerationProps } from './GenerationBase.js'
