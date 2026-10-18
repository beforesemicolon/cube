import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AlignmentGuideBase } from './AlignmentGuideBase.js'

export class AlignmentGuide extends AlignmentGuideBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-alignment-guide', AlignmentGuide)
export { AlignmentGuideBase }
export type { AlignmentGuideProps } from './AlignmentGuideBase.js'
