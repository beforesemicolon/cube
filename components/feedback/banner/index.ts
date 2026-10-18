import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { BannerBase } from './BannerBase.js'

export class Banner extends BannerBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-banner', Banner)
export { BannerBase }
export type { BannerProps } from './BannerBase.js'
