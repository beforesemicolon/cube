import { FieldControlBase, type FieldControlProps } from '../FormControlBase.js'
import { normalizeRange, type RangeOptions } from '../model.js'
import { bool, finite } from '../../core/value.js'
export interface SliderProps extends FieldControlProps<number>,RangeOptions { valueText?:string; stacked?:boolean }
export abstract class SliderBase extends FieldControlBase<SliderProps, number> {
    static observedAttributes=[...FieldControlBase.observedAttributes,'min','max','step','value','value-text','stacked']
    min=0;max=100;step:number|'any'=1;value=0;valueText='';stacked=false
    protected pointerActive=false
    get interacting():boolean{return this.pointerActive}
    get range(){return normalizeRange(this)}
    get valueAsNumber():number{return this.range.value}
    protected captureValue():number{return this.value}
    protected restoreValue(value:number|string|File|FormData|null):void{const n=typeof value==='string'?Number(value):value;this.value=finite(typeof n==='number'?n:undefined,this.range.min)}
    protected syncFormValue():void{this.syncForm(String(this.range.value))}
    protected mount():void{super.mount();this.listen(this.ownerDocument,'pointerup',()=>this.pointerActive=false);this.listen(this.ownerDocument,'pointercancel',()=>this.pointerActive=false)}
    protected unmount():void{this.pointerActive=false}
    setValue(value:number,originalEvent?:Event):boolean{
        const next=normalizeRange({...this.range,value}).value
        return this.handleChange(next,originalEvent)
    }
    stepUp(count=1):void{this.setValue(this.range.value+(this.range.step==='any'?1:this.range.step)*finite(count,1))}
    stepDown(count=1):void{this.stepUp(-finite(count,1))}
}
