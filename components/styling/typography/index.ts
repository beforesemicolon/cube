import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TypographyBase } from './TypographyBase.js'

export class Typography extends TypographyBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-typography', Typography)
export { TypographyBase }
export type { TypographyProps } from './TypographyBase.js'
