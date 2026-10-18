import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PresenceBase } from './PresenceBase.js'

export class Presence extends PresenceBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-presence', Presence)
export { PresenceBase }
export type { PresenceProps } from './PresenceBase.js'
