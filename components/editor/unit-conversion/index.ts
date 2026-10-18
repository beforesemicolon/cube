import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { UnitConversionBase } from './UnitConversionBase.js'

export class UnitConversion extends UnitConversionBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-unit-conversion', UnitConversion)
export { UnitConversionBase }
export type { UnitConversionProps } from './UnitConversionBase.js'
