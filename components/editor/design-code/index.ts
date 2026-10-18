import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DesignCodeBase } from './DesignCodeBase.js'

export class DesignCode extends DesignCodeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-design-code', DesignCode)
export { DesignCodeBase }
export type { DesignCodeProps } from './DesignCodeBase.js'
