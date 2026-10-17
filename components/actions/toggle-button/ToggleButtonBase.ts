import { ButtonBase, type ButtonProps } from '../button/ButtonBase.js'
import { bool } from '../../core/value.js'
export interface ToggleButtonProps extends ButtonProps { pressed?:boolean }
export abstract class ToggleButtonBase extends ButtonBase<ToggleButtonProps> {
    static observedAttributes=[...ButtonBase.observedAttributes,'pressed'];pressed=false
    protected activate(event:Event):void{
        if(this.unavailable){event.preventDefault();event.stopImmediatePropagation();return}
        const next=!bool(this.pressed)
        if(!this.request('cb-before-change',{value:next,originalEvent:event})){event.preventDefault();return}
        this.pressed=next;this.emit('cb-change',{value:next,pressed:next,originalEvent:event})
    }
    toggle():void { if(!this.unavailable)this.actionElement()?.click() }
}
