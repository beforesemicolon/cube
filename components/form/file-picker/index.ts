import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { FilePickerBase } from './FilePickerBase.js'

export class FilePicker extends FilePickerBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-file-picker', FilePicker)
export { FilePickerBase }
export type { FilePickerProps } from './FilePickerBase.js'
