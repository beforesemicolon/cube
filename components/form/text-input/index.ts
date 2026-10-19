import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { TextInputBase } from './TextInputBase.js';
export class TextInput extends TextInputBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { TextInputBase };
export type { TextInputProps } from './TextInputBase.js';
