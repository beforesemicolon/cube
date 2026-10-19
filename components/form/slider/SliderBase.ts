import { FormControlBase, type FormControlProps } from '../FormControlBase.js'
import { normalizeRange, type RangeOptions } from '../model.js'
import { bool, finite } from '../../core/value.js'
export interface SliderProps extends FormControlProps,RangeOptions { valueText?:string; orientation?:'horizontal'|'vertical' }
export abstract class SliderBase extends FormControlBase<SliderProps, number> {
    static observedAttributes=[...FormControlBase.observedAttributes,'min','max','step','value','value-text','orientation']
    min=0;max=100;step:number|'any'=1;value=0;valueText='';orientation:'horizontal'|'vertical'='horizontal'
    protected pointerActive=false
    get interacting():boolean{return this.pointerActive}
    get range(){return normalizeRange(this)}
    get valueAsNumber():number{return this.range.value}
    protected captureValue():number{return this.value}
    protected restoreValue(value:number|string|File|FormData|null):void{const n=typeof value==='string'?Number(value):value;this.value=finite(typeof n==='number'?n:undefined,this.range.min)}
    protected mount():void{super.mount();this.listen(this.ownerDocument,'pointerup',()=>this.pointerActive=false);this.listen(this.ownerDocument,'pointercancel',()=>this.pointerActive=false)}
    protected unmount():void{this.pointerActive=false}
    setValue(value:number,originalEvent?:Event):boolean{
        if(this.unavailable||bool(this.readOnly)){this.syncView();return false}
        const next=normalizeRange({...this.range,value}).value
        if(Object.is(this.range.value,next))return false
        if(!this.request('beforechange',{value:next,originalEvent})){this.syncView();return false}
        this.value=next;this.syncView();this.emit('change',{value:next,originalEvent});return true
    }
    stepUp(count=1):void{this.setValue(this.range.value+(this.range.step==='any'?1:this.range.step)*finite(count,1))}
    stepDown(count=1):void{this.stepUp(-finite(count,1))}
}
