import { register } from '../../core/Component.js'
import componentStylesheet from '../../studio/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TextInputBase } from './TextInputBase.js'
import { scalarText } from '../../core/value.js'
export class TextInput extends TextInputBase {
    stylesheet = componentStylesheet

    private view?: StudioView
    render(): Template {
        this.view = createStudioView(this)
        return this.view.root
    }
    protected syncView(): void {
        this.view?.update()
        const width = scalarText(this.width)
        if (width)
            this.style.setProperty('--component-studio-control-width', width)
        else this.style.removeProperty('--component-studio-control-width')
        const control = this.fieldElement()
        if (this.referenceController) this.referenceController.sync()
        else if (control && control.value !== this.value)
            control.value = this.value
    }
}
export { TextInputBase }
export type { TextInputProps } from './TextInputBase.js'

register('cb-text-input', TextInput)
