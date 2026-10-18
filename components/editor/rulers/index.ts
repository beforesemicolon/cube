import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RulersBase } from './RulersBase.js'

export class Rulers extends RulersBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-rulers', Rulers)
export { RulersBase }
export type { RulersProps } from './RulersBase.js'
