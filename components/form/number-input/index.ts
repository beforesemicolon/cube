import { register } from '../../core/Component.js'
import componentStylesheet from '../../studio/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { NumberInputBase } from './NumberInputBase.js';
export class NumberInput extends NumberInputBase {
    stylesheet = componentStylesheet

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { NumberInputBase };
export type { NumberInputProps } from './NumberInputBase.js';

register('cb-number-input', NumberInput)
