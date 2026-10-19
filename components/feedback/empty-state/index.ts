import { css as componentStyles, type Template } from '../../core/runtime.js'
import {  createStudioView, type StudioView , studioCSS } from '../../studio/view.js';
import { EmptyStateBase } from './EmptyStateBase.js';
export class EmptyState extends EmptyStateBase {
    stylesheet = componentStyles`${studioCSS}`

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { EmptyStateBase };
export type { EmptyStateProps } from './EmptyStateBase.js';
