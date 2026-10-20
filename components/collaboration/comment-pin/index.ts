import componentStylesheet from '../../studio/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { CommentPinBase } from './CommentPinBase.js';
export class CommentPin extends CommentPinBase {
    stylesheet = componentStylesheet

    private view?: StudioView;
    render(): Template { this.view = createStudioView(this); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
}
export { CommentPinBase };
export type { CommentPinProps } from './CommentPinBase.js';
