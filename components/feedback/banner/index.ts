import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js';
import { BannerBase } from './BannerBase.js';
export class Banner extends BannerBase {
    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { BannerBase };
export type { BannerProps } from './BannerBase.js';
