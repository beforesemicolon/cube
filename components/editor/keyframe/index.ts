import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { KeyframeBase } from './KeyframeBase.js'

export class Keyframe extends KeyframeBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-keyframe', Keyframe)
export { KeyframeBase }
export type { KeyframeProps } from './KeyframeBase.js'
