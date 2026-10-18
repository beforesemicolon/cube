import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TextareaBase } from './TextareaBase.js'

export class Textarea extends TextareaBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-textarea', Textarea)
export { TextareaBase }
export type { TextareaProps } from './TextareaBase.js'
