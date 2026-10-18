import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { CollapsibleSidebarBase } from './CollapsibleSidebarBase.js'

export class CollapsibleSidebar extends CollapsibleSidebarBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-collapsible-sidebar', CollapsibleSidebar)
export { CollapsibleSidebarBase }
export type { CollapsibleSidebarProps } from './CollapsibleSidebarBase.js'
