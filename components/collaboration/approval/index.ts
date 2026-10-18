import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ApprovalBase } from './ApprovalBase.js'

export class Approval extends ApprovalBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-approval', Approval)
export { ApprovalBase }
export type { ApprovalProps } from './ApprovalBase.js'
