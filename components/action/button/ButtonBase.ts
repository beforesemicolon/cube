import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool, scalarText } from '../../core/value.js'
export type ButtonVariant = 'primary'|'secondary'|'outline'|'ghost'|'destructive'
export interface ButtonProps extends UIProps {
    variant?: ButtonVariant; loading?:boolean; icon?:string; pressed?:boolean
    type?:'button'|'submit'|'reset'; name?:string; value?:string; formNoValidate?:boolean
    popupType?: 'menu'|'listbox'|'tree'|'grid'|'dialog'|''; popupExpanded?:boolean; popupControls?:string
}
export abstract class ButtonBase<P extends ButtonProps = ButtonProps> extends UIComponent<P> {
    static formAssociated=true
    static observedAttributes=[...UIComponent.observedAttributes,'variant','loading','icon','pressed','type','name','value','form-no-validate','popup-type','popup-expanded','popup-controls']
    variant:ButtonProps['variant']='secondary';loading=false;icon='';pressed:boolean|undefined=undefined;type:ButtonProps['type']='button';name='';value='';formNoValidate=false
    popupType:ButtonProps['popupType']='';popupExpanded=false;popupControls=''
    protected abstract actionElement(): HTMLElement | undefined
    protected get unavailable():boolean { return super.unavailable||bool(this.loading)||this.matches(':disabled') }
    formDisabledCallback(_disabled:boolean):void { if(this.mounted){this.syncCommon();this.syncView()} }
    get form():HTMLFormElement|null { return this.internals?.form??null }
    focus(options?:FocusOptions):void { const control=this.actionElement();if(control)control.focus(options);else super.focus(options) }
    click():void { if(!this.unavailable)this.actionElement()?.click() }
    toggle():void { if(this.pressed!==undefined&&!this.unavailable)this.actionElement()?.click() }
    protected activate(event:Event):void {
        if(this.unavailable){event.preventDefault();event.stopImmediatePropagation();return}
        if(this.pressed!==undefined){
            const next=!bool(this.pressed)
            if(!this.request('cb-before-change',{value:next,pressed:next,originalEvent:event})){event.preventDefault();return}
            this.pressed=next
            this.emit('cb-change',{value:next,pressed:next,originalEvent:event})
            return
        }
        if(!this.request('cb-before-action',{value:this.value,originalEvent:event})){event.preventDefault();return}
        this.emit('cb-action',{value:this.value,originalEvent:event})
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
