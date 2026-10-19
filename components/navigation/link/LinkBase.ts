import { ButtonBase, type ButtonProps } from '../../action/button/ButtonBase.js'
export type LinkProps = Omit<ButtonProps,'pressed'> & { href?:string; target?:string; download?:string }
export abstract class LinkBase extends ButtonBase<LinkProps> {
    static observedAttributes=[...ButtonBase.observedAttributes.filter(attribute=>attribute!=='pressed'),'href','target','download']
    href='';target='';download='';variant:ButtonProps['variant']='ghost'
    protected activate(event:Event):void { if(this.unavailable){event.preventDefault();event.stopImmediatePropagation();return} if(!this.request('beforenavigate',{href:this.href,originalEvent:event})){event.preventDefault();return} this.emit('navigate',{href:this.href,originalEvent:event}) }
}
