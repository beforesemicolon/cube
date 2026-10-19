import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { FilePickerBase } from './FilePickerBase.js';
export class FilePicker extends FilePickerBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { FilePickerBase };
export type { FilePickerProps } from './FilePickerBase.js';
