import { register } from '../../core/Component.js'
import { aria, safeHref } from '../../core/editor-dom.js'
import { buttonView } from '../../action/button/view.js'
import { LinkBase } from './LinkBase.js'
export class Link extends LinkBase {
    private view?:ReturnType<typeof buttonView>
    render():Node{this.view=buttonView(this,e=>this.activate(e),'a');this.view.control.style.cssText='padding:0;min-height:var(--cb-height);border:0;background:transparent;color:var(--color-signal-text,#1D50B3);text-decoration:underline;text-underline-offset:3px';return this.view.root}
    protected actionElement(){return this.view?.control}
    protected syncView():void{this.view?.update();if(!this.view)return;const a=this.view.control as HTMLAnchorElement;const href=safeHref(this.href,this.baseURI);aria(a,'href',this.unavailable?null:href);aria(a,'role',!href?'link':null);aria(a,'target',this.target);aria(a,'rel',this.target==='_blank'?'noopener noreferrer':null);aria(a,'download',this.download);a.tabIndex=this.unavailable?-1:0}
}
register('cb-link',Link)
export { LinkBase }
export type { LinkProps } from './LinkBase.js'
