import { ButtonBase, type ButtonProps } from '../../action/button/ButtonBase.js'
export interface LinkProps extends ButtonProps { href?:string; target?:string; download?:string }
export abstract class LinkBase extends ButtonBase<LinkProps> {
    static observedAttributes=[...ButtonBase.observedAttributes,'href','target','download']
    href='';target='';download='';variant:ButtonProps['variant']='ghost'
    protected activate(event:Event):void { if(this.unavailable){event.preventDefault();event.stopImmediatePropagation();return} if(!this.request('cb-before-navigate',{href:this.href,originalEvent:event})){event.preventDefault();return} this.emit('cb-navigate',{href:this.href,originalEvent:event}) }
}
