import { Component, type ComponentProps } from '../core/Component.js'
import { bool, text, scalarText } from '../core/value.js'
export interface FormControlSharedProps extends ComponentProps {
    name?: string
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
/** Form association, value restoration, reset, and fieldset disabling shared by form controls. */
export abstract class FormControlBase<P extends FormControlSharedProps=FormControlProps, S=string> extends Component<P> {
    static formAssociated=true
    static observedAttributes=[...Component.observedAttributes,'name','value','form-no-validate']
    name='';formNoValidate=false
    private initialized=false
    private initialValue?:{readonly value:S}
    private disabledByForm=false
    private readonly containValueEvent:EventListener=event=>{
        if(event.target!==this)event.stopPropagation()
    }
    protected validationShown=false
    protected abstract fieldElement():HTMLButtonElement|HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|undefined
    protected abstract captureValue():S
    protected abstract restoreValue(value:S|FormRestoreValue):void
    protected syncFormValue():void{}
    protected get unavailable():boolean{return super.unavailable||this.disabledByForm}
    controlUnavailable():boolean{return this.unavailable}
    get form():HTMLFormElement|null{return this.internals?.form??null}
    get labels():NodeList|undefined{return this.internals?.labels}
    get willValidate():boolean{return this.internals?.willValidate??false}
    get validity():ValidityState|undefined{return this.internals?.validity}
    get validationMessage():string{return this.internals?.validationMessage??''}
    protected mount():void{
        if(!this.initialized){this.initialized=true;this.initialValue={value:this.captureValue()}}
        for(const name of ['beforeinput','input','change'])this.listen(this.contentRoot,name,this.containValueEvent)
        super.mount();this.syncFormValue()
    }
    protected update(name:string):void{super.update(name);this.syncFormValue()}
    protected syncForm(value:string|File|FormData|null):void {
        // The native successful-control algorithm reads the attribute, not a custom JS property.
        const name=scalarText(this.name)
        if(name){if(this.getAttribute('name')!==name)this.setAttribute('name',name)}else if(this.hasAttribute('name'))this.removeAttribute('name')
        this.internals?.setFormValue(this.unavailable?null:value,value)
    }
    checkValidity():boolean{return this.internals?.checkValidity()??true}
    reportValidity():boolean{this.validationShown=true;this.syncView();return this.internals?.reportValidity()??true}
    formAssociatedCallback(_form:HTMLFormElement|null):void{if(this.mounted)this.syncFormValue()}
    formDisabledCallback(disabled:boolean):void{this.disabledByForm=disabled;if(this.mounted){this.syncCommon();this.syncView();this.syncFormValue()}}
    formResetCallback():void{this.validationShown=false;if(this.initialValue)this.restoreValue(this.initialValue.value);if(this.mounted){this.syncView();this.syncFormValue()}}
    formStateRestoreCallback(value:FormRestoreValue):void{this.restoreValue(value);if(this.mounted){this.syncView();this.syncFormValue()}}
    focus(options?:FocusOptions):void{const control=this.fieldElement();if(control)control.focus(options);else super.focus(options)}
}

/** Validation state shared by editable fields, without exposing field-only props on buttons. */
export abstract class FieldControlBase<P extends FieldControlSharedProps=FieldControlProps, S=string> extends FormControlBase<P,S> {
    static observedAttributes=[...FormControlBase.observedAttributes,'required','read-only','error-text']
    required=false;readOnly=false;errorText=''
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
