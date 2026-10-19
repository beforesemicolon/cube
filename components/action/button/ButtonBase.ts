import { FormControlBase, type FormControlProps, type FormRestoreValue } from '../../form/FormControlBase.js'
import { bool, scalarText } from '../../core/value.js'
export type ButtonVariant = 'primary'|'secondary'|'outline'|'ghost'|'destructive'
export interface ButtonProps extends FormControlProps<string> {
    variant?: ButtonVariant; loading?:boolean; icon?:string; iconOnly?:boolean; pressed?:boolean
    type?:'button'|'submit'|'reset'
}
export abstract class ButtonBase<P extends ButtonProps = ButtonProps> extends FormControlBase<P> {
    static observedAttributes=[
        ...FormControlBase.observedAttributes,
        'variant','loading','icon','icon-only','pressed','type',
        'role','aria-haspopup','aria-expanded','aria-controls','aria-selected','aria-current','aria-checked',
        'aria-valuemin','aria-valuemax','aria-valuenow','aria-valuetext','aria-description','aria-keyshortcuts',
    ]
    variant:ButtonProps['variant']='secondary';loading=false;icon='';iconOnly=false;pressed:boolean|undefined=undefined;type:ButtonProps['type']='button';value=''
    private readonly controlAttributes = new Map<string, string>()
    protected abstract actionElement(): HTMLButtonElement | HTMLAnchorElement | undefined
    protected fieldElement(): HTMLButtonElement | undefined { const control=this.actionElement();return control instanceof HTMLButtonElement?control:undefined }
    protected captureValue(): string { return scalarText(this.value) }
    protected restoreValue(value: string | FormRestoreValue): void { this.value = value instanceof FormData ? scalarText(value.get(this.name)) : scalarText(value) }
    protected syncFormValue(): void { this.syncForm(null) }
    protected get unavailable():boolean { return super.unavailable||bool(this.loading)||this.matches(':disabled') }
    setControlAttribute(name:string,value:string|null|undefined):void {
        if(value===null||value===undefined||value==='')this.controlAttributes.delete(name);else this.controlAttributes.set(name,value)
        this.syncView()
    }
    applyControlAttributes(control:HTMLElement):void {
        for(const [name,value] of this.controlAttributes)control.setAttribute(name,value)
    }
    focus(options?:FocusOptions):void { if(this.hasAttribute('data-semantic-host'))HTMLElement.prototype.focus.call(this,options);else{const control=this.actionElement();if(control)control.focus(options);else super.focus(options)} }
    click():void { if(this.unavailable)return;if(this.hasAttribute('data-semantic-host'))super.click();else this.actionElement()?.click() }
    toggle():void { if(this.pressed!==undefined&&!this.unavailable)this.actionElement()?.click() }
    protected activate(event:Event):void {
        if(this.unavailable){event.preventDefault();event.stopImmediatePropagation();return}
        if(this.pressed!==undefined){
            const next=!bool(this.pressed)
            if(!this.commitState(bool(this.pressed),next,event,{pressed:next},pressed=>this.pressed=pressed)){event.preventDefault();return}
            return
        }
        if(!this.request('beforeaction',{value:this.value,originalEvent:event})){event.preventDefault();return}
        this.emit('action',{value:this.value,originalEvent:event})
        const form=this.form
        if(form&&this.type==='reset')form.reset()
        if(form&&this.type==='submit'){
            // A native temporary submitter preserves name/value, validation and submitter semantics.
            const proxy=this.ownerDocument.createElement('button');proxy.type='submit';proxy.name=scalarText(this.name);proxy.value=scalarText(this.value);proxy.formNoValidate=bool(this.formNoValidate);proxy.hidden=true
            form.append(proxy)
            try { form.requestSubmit(proxy) } finally { proxy.remove() }
        }
    }
}
