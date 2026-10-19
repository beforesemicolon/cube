import { type Template } from '../../core/runtime.js'
import { safeHref } from '../../core/url.js'
import { buttonView } from '../../action/button/view.js';
import { LinkBase } from './LinkBase.js';
export class Link extends LinkBase {
    private view?: ReturnType<typeof buttonView>;
    render(): Template { this.view = buttonView(this, e => this.activate(e), 'a', {href:()=>safeHref(this.href,this.baseURI),target:()=>this.target,download:()=>this.download}); return this.view.root; }
    protected actionElement() { return this.view?.control; }
    protected syncView(): void { this.view?.update(); }
}
export { LinkBase };
export type { LinkProps } from './LinkBase.js';
