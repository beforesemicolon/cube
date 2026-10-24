import { register } from '../../core/Component.js'
import componentStylesheet from '../../studio/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { UnitInputBase } from './UnitInputBase.js';
export class UnitInput extends UnitInputBase {
    stylesheet = componentStylesheet

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { UnitInputBase };
export type { UnitInputProps, UnitOption } from './UnitInputBase.js';

register('cb-unit-input', UnitInput)
