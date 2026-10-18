import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DescriptionRowBase } from './DescriptionRowBase.js'

export class DescriptionRow extends DescriptionRowBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-description-row', DescriptionRow)
export { DescriptionRowBase }
export type { DescriptionRowProps } from './DescriptionRowBase.js'
