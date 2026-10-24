import { register } from '../../core/Component.js'
import componentStylesheet from '../../studio/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FilePickerBase } from './FilePickerBase.js';
export class FilePicker extends FilePickerBase {
    stylesheet = componentStylesheet

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { FilePickerBase };
export type { FilePickerProps } from './FilePickerBase.js';

register('cb-file-picker', FilePicker)
