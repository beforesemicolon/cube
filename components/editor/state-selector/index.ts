import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { StateSelectorBase } from './StateSelectorBase.js'

export class StateSelector extends StateSelectorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-state-selector', StateSelector)
export { StateSelectorBase }
export type { StateSelectorProps } from './StateSelectorBase.js'
