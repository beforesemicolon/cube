import { Component, type ComponentProps } from '../core/Component.js'
import { bool, text, scalarText } from '../core/value.js'
import { state } from '../core/runtime.js'
export interface FormControlSharedProps extends ComponentProps {
    name?: string
    disabled?: boolean
    formNoValidate?: boolean
}
export interface FormControlProps<Value = string> extends FormControlSharedProps { value?: Value }
export interface FieldControlSharedProps extends FormControlSharedProps {
    required?: boolean
    readOnly?: boolean
    errorText?: string
}
export interface FieldControlProps<Value = string> extends FormControlProps<Value>, FieldControlSharedProps {}
export type FormRestoreValue = string | File | FormData | null
export type FormRestoreMode = 'restore' | 'autocomplete'

/** Form association, value restoration, reset, and fieldset disabling shared by form controls. */
export abstract class FormControlBase<P extends FormControlSharedProps=FormControlProps, S=string, V=S> extends Component<P> {
    static formAssociated=true
    static observedAttributes=[...Component.observedAttributes,'name','value','form-no-validate']
    value!:V
    disabled=false
    name='';formNoValidate=false
    private initialized=false
    private initialValue?:{readonly value:S}
    private readonly disabledByForm=state(false)
    private readonly containValueEvent:EventListener=event=>{
        if(event.target!==this)event.stopPropagation()
    }
    private readonly validationVisible=state(false)
    protected get validationShown():boolean{return this.validationVisible[0]()}
    protected set validationShown(value:boolean){this.validationVisible[1](value)}
    protected abstract fieldElement():HTMLButtonElement|HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|undefined
    protected abstract captureValue():S
    protected abstract restoreValue(value:S|FormRestoreValue):void
    protected serializedValue():FormRestoreValue {
        const value=this.value
        if(value instanceof File||value instanceof FormData)return value
        if(Array.isArray(value)){
            const data=new FormData()
            if(this.name)for(const item of value)data.append(this.name,scalarText(item))
            return data
        }
        return value===null||value===undefined?'':scalarText(value)
    }
    protected syncFormValue():void{this.syncForm(this.serializedValue())}
    protected canChangeValue():boolean{return !this.unavailable}
    protected normalizeValue(value:V):V{return value}
    protected valuesEqual(previousValue:V,value:V):boolean{
        if(Array.isArray(previousValue)&&Array.isArray(value))return previousValue.length===value.length&&previousValue.every((item,index)=>Object.is(item,value[index]))
        return Object.is(previousValue,value)
    }
    protected applyValue(value:V):void{this.value=value}
    protected handleChange(value:V,originalEvent?:Event,detail:object={}):boolean{
        return this.commitValue(value,originalEvent,detail)
    }
    protected commitValue(value:V,originalEvent?:Event,detail:object={},apply?:((value:V)=>void)):boolean{
        const nextValue=this.normalizeValue(value)
        const previousValue=this.value
        return this.commitState(previousValue,nextValue,originalEvent,detail,changed=>{
            if(apply)apply(changed);else this.applyValue(changed)
        },(previous,changed)=>this.valuesEqual(previous,changed))
    }
    protected commitState<Value>(previousValue:Value,value:Value,originalEvent:Event|undefined,detail:object,apply:(value:Value)=>void,equal:(previousValue:Value,value:Value)=>boolean=Object.is):boolean{
        if(!this.canChangeValue()){this.syncView();return false}
        if(equal(previousValue,value))return false
        const changeDetail={value,previousValue,...detail,originalEvent}
        if(!this.request('beforechange',changeDetail)){this.syncView();return false}
        apply(value)
        this.syncView()
        this.syncValue()
        this.emit('change',changeDetail)
        return true
    }
    protected get unavailable():boolean{return super.unavailable||this.disabledByForm[0]()}
    controlUnavailable():boolean{return this.unavailable}
    get form():HTMLFormElement|null{return this.internals?.form??null}
    get labels():NodeList|undefined{return this.internals?.labels}
    get willValidate():boolean{return this.internals?.willValidate??false}
    get validity():ValidityState|undefined{return this.internals?.validity}
    get validationMessage():string{return this.internals?.validationMessage??''}
    protected mount():void{
        if(!this.initialized){this.initialized=true;this.initialValue={value:this.captureValue()}}
        for(const name of ['beforeinput','input','change'])this.listen(this.contentRoot,name,this.containValueEvent)
        super.mount();this.syncValue()
    }
    protected update(name:string):void{super.update(name);this.syncValue()}
    private syncValue():void{this.syncFormValue()}
    protected syncForm(value:string|File|FormData|null):void {
        // The native successful-control algorithm reads the attribute, not a custom JS property.
        const name=scalarText(this.name)
        if(name){if(this.getAttribute('name')!==name)this.setAttribute('name',name)}else if(this.hasAttribute('name'))this.removeAttribute('name')
        this.internals?.setFormValue(this.unavailable?null:value,value)
    }
    checkValidity():boolean{return this.internals?.checkValidity()??true}
    reportValidity():boolean{this.validationShown=true;this.syncView();return this.internals?.reportValidity()??true}
    formAssociatedCallback(_form:HTMLFormElement|null):void{if(this.mounted)this.syncValue()}
    formDisabledCallback(disabled:boolean):void{this.disabledByForm[1](disabled);if(this.mounted){this.syncCommon();this.syncView();this.syncValue()}}
    formResetCallback():void{this.validationShown=false;if(this.initialValue)this.restoreValue(this.initialValue.value);if(this.mounted){this.syncView();this.syncValue()}}
    formStateRestoreCallback(value:FormRestoreValue,_mode:FormRestoreMode):void{this.restoreValue(value);if(this.mounted){this.syncView();this.syncValue()}}
    focus(options?:FocusOptions):void{const control=this.fieldElement();if(control)control.focus(options);else super.focus(options)}
}

/** Validation state shared by editable fields, without exposing field-only props on buttons. */
export abstract class FieldControlBase<P extends FieldControlSharedProps=FieldControlProps, S=string, V=S> extends FormControlBase<P,S,V> {
    static observedAttributes=[...FormControlBase.observedAttributes,'required','read-only','error-text']
    required=false;readOnly=false;errorText=''
    protected canChangeValue():boolean{return super.canChangeValue()&&!bool(this.readOnly)}
    protected syncForm(value:string|File|FormData|null):void {
        super.syncForm(value)
        const control=this.fieldElement();if(!control)return
        control.setCustomValidity(text(this.errorText))
        const flags:ValidityStateFlags={}
        if(!this.unavailable&&!bool(this.readOnly))for(const key of ['badInput','customError','patternMismatch','rangeOverflow','rangeUnderflow','stepMismatch','tooLong','tooShort','typeMismatch','valueMissing'] as const)if(control.validity[key])flags[key]=true
        this.internals?.setValidity(flags,Object.keys(flags).length?control.validationMessage:'',control)
    }
    setCustomValidity(message:string):void{this.errorText=message;if(this.mounted){this.syncView();this.syncFormValue()}}
}
