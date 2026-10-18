import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { PublishDialogBase } from './PublishDialogBase.js'

export class PublishDialog extends PublishDialogBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-publish-dialog', PublishDialog)
export { PublishDialogBase }
export type { PublishDialogProps } from './PublishDialogBase.js'
