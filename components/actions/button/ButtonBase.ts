import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool, text } from '../../core/value.js'
export interface ButtonProps extends UIProps {
    variant?: 'primary'|'secondary'|'outline'|'ghost'|'destructive'; loading?:boolean; icon?:string
    type?:'button'|'submit'|'reset'; name?:string; value?:string; formNoValidate?:boolean
}
export abstract class ButtonBase<P extends ButtonProps = ButtonProps> extends UIComponent<P> {
    static formAssociated=true
    static observedAttributes=[...UIComponent.observedAttributes,'variant','loading','icon','type','name','value','form-no-validate']
    variant:ButtonProps['variant']='secondary';loading=false;icon='';type:ButtonProps['type']='button';name='';value='';formNoValidate=false
    private fieldsetDisabled=false
    protected abstract actionElement(): HTMLElement | undefined
    protected get unavailable():boolean { return super.unavailable||bool(this.loading)||this.fieldsetDisabled }
    formDisabledCallback(disabled:boolean):void { this.fieldsetDisabled=disabled;if(this.mounted){this.syncCommon();this.syncView()} }
    get form():HTMLFormElement|null { return this.internals?.form??null }
    focus(options?:FocusOptions):void { const control=this.actionElement();if(control)control.focus(options);else super.focus(options) }
    click():void { if(!this.unavailable)this.actionElement()?.click() }
    protected activate(event:Event):void {
        if(this.unavailable){event.preventDefault();event.stopImmediatePropagation();return}
        if(!this.request('cb-before-action',{value:this.value,originalEvent:event})){event.preventDefault();return}
        this.emit('cb-action',{value:this.value,originalEvent:event})
        const form=this.form
        if(form&&this.type==='reset')form.reset()
        if(form&&this.type==='submit'){
            // A native temporary submitter preserves name/value, validation and submitter semantics.
            const proxy=this.ownerDocument.createElement('button');proxy.type='submit';proxy.name=text(this.name);proxy.value=text(this.value);proxy.formNoValidate=bool(this.formNoValidate);proxy.hidden=true
            form.append(proxy)
            try { form.requestSubmit(proxy) } finally { proxy.remove() }
        }
    }
}
