import { FormFieldBase, type FormFieldProps } from '../FormFieldBase.js'
import { normalizeOptions, type SelectOption } from '../model.js'
import { bool,text,scalarText } from '../../core/value.js'
export interface SelectProps extends FormFieldProps { options?:SelectOption[]; value?:string|string[]; multiple?:boolean; placeholder?:string }
export abstract class SelectBase extends FormFieldBase<SelectProps> {
    static observedAttributes=[...FormFieldBase.observedAttributes,'options','value','multiple','placeholder']
    options:SelectOption[]=[];value:string|string[]='';multiple=false;placeholder=''
    get normalizedOptions(){return normalizeOptions(this.options)}
    get selection():string[]{const values=(Array.isArray(this.value)?this.value:[this.value]).map(v=>scalarText(v));return values.filter(v=>this.normalizedOptions.some(o=>o.value===v))}
    protected captureValue():unknown{return Array.isArray(this.value)?[...this.value]:this.value}
    protected restoreValue(value:unknown):void{this.value=value instanceof FormData?value.getAll(this.name).filter((v):v is string=>typeof v==='string'):Array.isArray(value)?value.filter((v):v is string=>typeof v==='string'):scalarText(value)}
    choose(value:string|string[],originalEvent?:Event):boolean{
        if(this.unavailable||bool(this.readOnly)){this.syncView();return false}
        const values=(Array.isArray(value)?value:[value]).filter(v=>v===''||this.normalizedOptions.some(o=>o.value===v&&!o.disabled))
        const next=bool(this.multiple)?values:values[0]??''
        if(!this.request('cb-before-change',{value:next,originalEvent})){this.syncView();return false}
        this.value=next;this.syncView();this.emit('cb-change',{value:next,originalEvent});return true
    }
}
