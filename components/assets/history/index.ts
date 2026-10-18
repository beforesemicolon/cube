import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { HistoryBase } from './HistoryBase.js'

export class History extends HistoryBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-history', History)
export { HistoryBase }
export type { HistoryProps } from './HistoryBase.js'
