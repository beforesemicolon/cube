import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { InspectorSidebarBase } from './InspectorSidebarBase.js'

export class InspectorSidebar extends InspectorSidebarBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-inspector-sidebar', InspectorSidebar)
export { InspectorSidebarBase }
export type { InspectorSidebarProps } from './InspectorSidebarBase.js'
