import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { VersionHistoryBase } from './VersionHistoryBase.js'

export class VersionHistory extends VersionHistoryBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-version-history', VersionHistory)
export { VersionHistoryBase }
export type { VersionHistoryProps } from './VersionHistoryBase.js'
