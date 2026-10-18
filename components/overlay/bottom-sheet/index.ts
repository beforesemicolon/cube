import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { BottomSheetBase } from './BottomSheetBase.js'

export class BottomSheet extends BottomSheetBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-bottom-sheet', BottomSheet)
export { BottomSheetBase }
export type { BottomSheetProps } from './BottomSheetBase.js'
