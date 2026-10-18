import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ColorPickerBase } from './ColorPickerBase.js'

export class ColorPicker extends ColorPickerBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-color-picker', ColorPicker)
export { ColorPickerBase }
export type { ColorPickerProps } from './ColorPickerBase.js'
