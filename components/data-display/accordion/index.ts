import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AccordionBase } from './AccordionBase.js'

export class Accordion extends AccordionBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-accordion', Accordion)
export { AccordionBase }
export type { AccordionProps } from './AccordionBase.js'
