import { FieldControlBase, type FieldControlProps } from '../FormControlBase.js'
import { normalizeOptions, type SelectOption } from '../model.js'
import { bool, finite, scalarText } from '../../core/value.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength } from '../../core/popup.js'
export type SelectSearchMode = 'auto' | boolean
export interface SelectProps extends FieldControlProps<string|string[]>, PopupConstraintProps { options?:SelectOption[]; value?:string|string[]; multi?:boolean; placeholder?:string; native?:boolean; open?:boolean; searchable?:SelectSearchMode; searchThreshold?:number; searchLabel?:string; searchPlaceholder?:string; emptyLabel?:string }
export abstract class SelectBase extends FieldControlBase<SelectProps, string|string[]> {
    static observedAttributes=[...FieldControlBase.observedAttributes,'options','value','multi','placeholder','native','open','searchable','search-threshold','search-label','search-placeholder','empty-label',...popupConstraintAttributes]
    options:SelectOption[]=[];value:string|string[]='';multi=false;placeholder='';native=false;open=false;searchable:SelectSearchMode='auto';searchThreshold=10;searchLabel='';searchPlaceholder='';emptyLabel=''
    popupMaxWidth: PopupLength = '320px'; popupMaxHeight: PopupLength = '280px'
    get normalizedOptions(){return normalizeOptions(this.options)}
    get selection():string[]{const values=(Array.isArray(this.value)?this.value:[this.value]).map(v=>scalarText(v));const selected=values.filter(v=>this.normalizedOptions.some(o=>o.value===v));return bool(this.multi)?selected:selected.slice(0,1)}
    get searchEnabled():boolean{return this.searchable===true||(this.searchable==='auto'&&this.normalizedOptions.length>Math.max(0,finite(this.searchThreshold,10)))}
    protected captureValue():string|string[]{return Array.isArray(this.value)?[...this.value]:this.value}
    protected restoreValue(value:string|string[]|File|FormData|null):void{this.value=value instanceof FormData?value.getAll(this.name).filter((v):v is string=>typeof v==='string'):Array.isArray(value)?[...value]:scalarText(value)}
    protected syncFormValue():void{
        const selection=this.selection
        if(!bool(this.multi)){this.syncForm(selection[0]??'');return}
        const data=new FormData()
        if(this.name)for(const value of selection)data.append(this.name,value)
        this.syncForm(data)
    }
    choose(value:string|string[],originalEvent?:Event):boolean{
        if(this.unavailable||bool(this.readOnly)){this.syncView();return false}
        const values=(Array.isArray(value)?value:[value]).filter(v=>v===''||this.normalizedOptions.some(o=>o.value===v&&!o.disabled))
        const next=bool(this.multi)
            ? Array.isArray(value)
                ? values
                : this.selection.includes(values[0] ?? '')
                    ? this.selection.filter(item => item !== values[0])
                    : [...this.selection, ...values]
            : values[0]??''
        return this.handleChange(next,originalEvent)
    }
    setOpen(open:boolean,originalEvent?:Event):boolean{
        if(this.unavailable||bool(this.readOnly)||bool(this.native))return false
        if(bool(this.open)===open)return true
        if(!this.request(open?'beforeopen':'beforeclose',{open,originalEvent}))return false
        this.open=open;this.toggleAttribute('open',open);this.syncView();this.emit(open?'open':'close',{open,originalEvent});return true
    }
}
