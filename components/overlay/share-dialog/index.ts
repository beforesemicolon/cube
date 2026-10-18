import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ShareDialogBase } from './ShareDialogBase.js'

export class ShareDialog extends ShareDialogBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-share-dialog', ShareDialog)
export { ShareDialogBase }
export type { ShareDialogProps } from './ShareDialogBase.js'
