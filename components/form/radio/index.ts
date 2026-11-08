import { register } from '../../core/Component.js'
import { type Template } from '../../core/runtime.js'
import componentStylesheet from '../../studio/view.css?inline'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { RadioBase } from './RadioBase.js'

export class Radio extends RadioBase {
    stylesheet = componentStylesheet

    private view?: StudioView

    render(): Template {
        this.view = createStudioView(this)
        return this.view.root
    }

    protected syncView(): void {
        this.view?.update()
    }
}

export { RadioBase }
export type { RadioProps } from './RadioBase.js'

register('cb-radio', Radio)
