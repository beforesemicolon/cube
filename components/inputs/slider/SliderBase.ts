import { FormFieldBase, type FormFieldProps } from '../FormFieldBase.js'
import { normalizeRange, type RangeOptions } from '../model.js'
import { bool, finite } from '../../core/value.js'
export interface SliderProps extends FormFieldProps,RangeOptions { valueText?:string; orientation?:'horizontal'|'vertical' }
export abstract class SliderBase extends FormFieldBase<SliderProps> {
    static observedAttributes=[...FormFieldBase.observedAttributes,'min','max','step','value','value-text','orientation']
    min=0;max=100;step:number|'any'=1;value=0;valueText='';orientation:'horizontal'|'vertical'='horizontal'
    protected pointerActive=false
    get interacting():boolean{return this.pointerActive}
    get range(){return normalizeRange(this)}
    get valueAsNumber():number{return this.range.value}
    protected captureValue():unknown{return this.value}
    protected restoreValue(value:unknown):void{const n=typeof value==='string'?Number(value):value;this.value=finite(n,this.range.min)}
    protected mount():void{super.mount();this.listen(this.ownerDocument,'pointerup',()=>this.pointerActive=false);this.listen(this.ownerDocument,'pointercancel',()=>this.pointerActive=false)}
    protected unmount():void{this.pointerActive=false}
    setValue(value:number,phase:'input'|'change'='change',originalEvent?:Event):boolean{
        if(this.unavailable||bool(this.readOnly)){this.syncView();return false}
        const next=normalizeRange({...this.range,value}).value
        if(!this.request(phase==='input'?'cb-before-input':'cb-before-change',{value:next,originalEvent})){this.syncView();return false}
        this.value=next;this.syncView();this.emit(phase==='input'?'cb-input':'cb-change',{value:next,originalEvent});return true
    }
    stepUp(count=1):void{this.setValue(this.range.value+(this.range.step==='any'?1:this.range.step)*finite(count,1))}
    stepDown(count=1):void{this.stepUp(-finite(count,1))}
}
