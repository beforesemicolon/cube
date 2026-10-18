import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { UndoRedoBase } from './UndoRedoBase.js'

export class UndoRedo extends UndoRedoBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-undo-redo', UndoRedo)
export { UndoRedoBase }
export type { UndoRedoProps } from './UndoRedoBase.js'
