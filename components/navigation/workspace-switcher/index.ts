import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { WorkspaceSwitcherBase } from './WorkspaceSwitcherBase.js'

export class WorkspaceSwitcher extends WorkspaceSwitcherBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-workspace-switcher', WorkspaceSwitcher)
export { WorkspaceSwitcherBase }
export type { WorkspaceSwitcherProps } from './WorkspaceSwitcherBase.js'
