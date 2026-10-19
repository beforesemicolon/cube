import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { TextareaBase } from './TextareaBase.js';
export class Textarea extends TextareaBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { TextareaBase };
export type { TextareaProps } from './TextareaBase.js';
