import { register } from '../../core/Component.js'
import { SliderBase } from './SliderBase.js'
import { el,fragment,sheet,editorCSS,aria,uid } from '../../core/editor-dom.js'
import { bool,text } from '../../core/value.js'
export class Slider extends SliderBase {
    private control?:HTMLInputElement;private titleNode?:HTMLLabelElement;private descriptionNode?:HTMLElement;private errorNode?:HTMLElement
    render():Node{
        this.control=el('input','control');this.control.type='range';this.control.id=uid('cb-slider')
        this.titleNode=el('label','label');this.titleNode.htmlFor=this.control.id
        this.descriptionNode=el('p','description');this.descriptionNode.id=this.control.id+'-description'
        this.errorNode=el('p','error');this.errorNode.id=this.control.id+'-error'
        this.control.addEventListener('input',e=>this.setValue(this.control!.valueAsNumber,'input',e))
        this.control.addEventListener('change',e=>this.setValue(this.control!.valueAsNumber,'change',e))
        this.control.addEventListener('pointerdown',()=>this.pointerActive=true)
        this.control.addEventListener('blur',()=>this.pointerActive=false)
        return fragment(sheet(editorCSS+`
:host{display:block;min-inline-size:var(--component-slider-min-width,80px)}
[part=control]{display:block;appearance:none;inline-size:100%;padding:0;border:0;background:transparent;cursor:pointer}
[part=control]::-webkit-slider-runnable-track{block-size:var(--component-slider-track-height,4px);border-radius:var(--radius-sm,6px);background:linear-gradient(to right,var(--color-primary,#2563EB) var(--cb-slider-fill,0%),var(--color-track,#D8DCDE) var(--cb-slider-fill,0%))}
[part=control]::-webkit-slider-thumb{appearance:none;inline-size:var(--component-slider-thumb-size,12px);block-size:var(--component-slider-thumb-size,12px);border-radius:50%;background:var(--color-surface,#fff);border:2px solid var(--color-primary,#2563EB);margin-block-start:calc((var(--component-slider-track-height,4px) - var(--component-slider-thumb-size,12px))/2)}
[part=control]::-moz-range-track{block-size:var(--component-slider-track-height,4px);border-radius:var(--radius-sm,6px);background:var(--color-track,#D8DCDE)}
[part=control]::-moz-range-progress{block-size:var(--component-slider-track-height,4px);background:var(--color-primary,#2563EB)}
[part=control]::-moz-range-thumb{inline-size:var(--component-slider-thumb-size,12px);block-size:var(--component-slider-thumb-size,12px);border-radius:50%;background:var(--color-surface,#fff);border:2px solid var(--color-primary,#2563EB)}
[part=control]:disabled{cursor:not-allowed;opacity:var(--component-disabled-opacity,.5)}
:host([data-orientation=vertical]){min-inline-size:var(--cb-height);inline-size:var(--cb-height)}
:host([data-orientation=vertical]) [part=control]{writing-mode:vertical-lr;direction:rtl;block-size:var(--cb-height);inline-size:160px}
`),this.titleNode,this.control,this.descriptionNode,this.errorNode)
    }
    protected fieldElement(){return this.control}
    protected syncView():void{
        if(!this.control||!this.titleNode||!this.descriptionNode||!this.errorNode)return
        const range=this.range;this.dataset.orientation=this.orientation==='vertical'?'vertical':'horizontal'
        this.control.min=String(range.min);this.control.max=String(range.max);this.control.step=String(range.step)
        this.control.value=String(range.value);this.control.disabled=this.unavailable;this.control.style.setProperty('--cb-slider-fill',range.percent+'%')
        this.control.setAttribute('aria-label',this.accessibleName());this.control.setAttribute('aria-orientation',this.dataset.orientation)
        aria(this.control,'aria-valuetext',text(this.valueText)||null);aria(this.control,'aria-readonly',bool(this.readOnly)?true:null)
        this.titleNode.textContent=text(this.label);this.titleNode.hidden=!text(this.label)
        this.descriptionNode.textContent=text(this.description);this.descriptionNode.hidden=!text(this.description)
        this.syncForm(String(range.value));const error=!!this.validationMessage&&(this.validationShown||!!text(this.errorText))
        this.errorNode.textContent=error?this.validationMessage:'';this.errorNode.hidden=!error;aria(this.control,'aria-invalid',error?true:null)
        aria(this.control,'aria-describedby',[text(this.description)?this.descriptionNode.id:'',error?this.errorNode.id:''].filter(Boolean).join(' ')||null)
    }
}
register('cb-slider',Slider)
export { SliderBase }
export type { SliderProps } from './SliderBase.js'
