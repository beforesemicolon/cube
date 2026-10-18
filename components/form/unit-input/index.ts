import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import '../select/index.js'
import { UnitInputBase } from './UnitInputBase.js'

export class UnitInput extends UnitInputBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-unit-input', UnitInput)
export { UnitInputBase }
export type { UnitInputProps, UnitOption } from './UnitInputBase.js'
