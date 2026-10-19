import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { NumberInputBase } from './NumberInputBase.js';
export class NumberInput extends NumberInputBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { NumberInputBase };
export type { NumberInputProps } from './NumberInputBase.js';
