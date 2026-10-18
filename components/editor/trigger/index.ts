import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TriggerBase } from './TriggerBase.js'

export class Trigger extends TriggerBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-trigger', Trigger)
export { TriggerBase }
export type { TriggerProps } from './TriggerBase.js'
