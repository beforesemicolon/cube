import { UIComponent, type UIProps } from '../core/UIComponent.js'
import { bool, text } from '../core/value.js'
export interface FormFieldProps extends UIProps { name?:string; required?:boolean; readOnly?:boolean; errorText?:string }
/** Form association, validation, reset and fieldset disabling shared by all input renderers. */
export abstract class FormFieldBase<P extends FormFieldProps=FormFieldProps> extends UIComponent<P> {
    static formAssociated=true
    static observedAttributes=[...UIComponent.observedAttributes,'name','required','read-only','error-text']
    name='';required=false;readOnly=false;errorText=''
    private fieldsetDisabled=false;private initialized=false;private initialValue:unknown
    protected validationShown=false
    protected abstract fieldElement():HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|undefined
    protected abstract captureValue():unknown
    protected abstract restoreValue(value:unknown):void
    protected get unavailable():boolean{return super.unavailable||this.fieldsetDisabled}
    get form():HTMLFormElement|null{return this.internals?.form??null}
    get validity():ValidityState|undefined{return this.internals?.validity}
    get validationMessage():string{return this.internals?.validationMessage??''}
    protected mount():void{if(!this.initialized){this.initialized=true;this.initialValue=this.captureValue()}super.mount()}
    protected syncForm(value:string|FormData|null):void {
        this.internals?.setFormValue(this.unavailable?null:value,value)
        const control=this.fieldElement();if(!control)return
        control.setCustomValidity(text(this.errorText))
        const flags:ValidityStateFlags={}
        if(!this.unavailable&&!bool(this.readOnly))for(const key of ['badInput','customError','patternMismatch','rangeOverflow','rangeUnderflow','stepMismatch','tooLong','tooShort','typeMismatch','valueMissing'] as const)if(control.validity[key])flags[key]=true
        this.internals?.setValidity(flags,Object.keys(flags).length?control.validationMessage:'',control)
    }
    checkValidity():boolean{return this.internals?.checkValidity()??true}
    reportValidity():boolean{this.validationShown=true;this.syncView();return this.internals?.reportValidity()??true}
    formDisabledCallback(disabled:boolean):void{this.fieldsetDisabled=disabled;if(this.mounted){this.syncCommon();this.syncView()}}
    formResetCallback():void{this.validationShown=false;this.restoreValue(this.initialValue);if(this.mounted)this.syncView()}
    formStateRestoreCallback(value:string|File|FormData|null):void{this.restoreValue(value);if(this.mounted)this.syncView()}
    focus(options?:FocusOptions):void{const control=this.fieldElement();if(control)control.focus(options);else super.focus(options)}
}
